import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class TriangleMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _centerTime: number;
    private _centerPrice: number;
    private _sizeTime: number = 0;
    private _sizePrice: number = 0;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'center' | 'vertex1' | 'vertex2' | 'vertex3' | 'triangle' | 'rotation' | null = null;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.Triangle;
    private _fillColor: string = '';
    private _pixelSize: number = 50;
    private _rotation: number = 0;
    private _vertices: { x: number, y: number }[] = [];
    private _rotationHandleDistance: number = 70;

    constructor(
        centerTime: number,
        centerPrice: number,
        sizeTime: number = 0,
        sizePrice: number = 0,
        color: string = '#2962FF',
        lineWidth: number = 2,
        isPreview: boolean = false
    ) {
        this._centerTime = centerTime;
        this._centerPrice = centerPrice;
        this._sizeTime = sizeTime;
        this._sizePrice = sizePrice;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;
        this._fillColor = this.hexToRGBA(color, 0.2);
        this._pixelSize = this.calculatePixelSize();
        this._rotation = 0;
        this.calculateVertices();
    }

    private hexToRGBA(hex: string, alpha: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    getMarkType(): MarkType {
        return this.markType;
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this.calculateVertices();
        this.requestUpdate();
    }

    updateAllViews() { }

    updateSize(sizeTime: number, sizePrice: number) {
        this._sizeTime = sizeTime;
        this._sizePrice = sizePrice;
        this._pixelSize = this.calculatePixelSize();
        this.calculateVertices();
        this.requestUpdate();
    }

    updateCenter(centerTime: number, centerPrice: number) {
        this._centerTime = centerTime;
        this._centerPrice = centerPrice;
        this.calculateVertices();
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'center' | 'vertex1' | 'vertex2' | 'vertex3' | 'triangle' | 'rotation' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }


    private calculateVertices() {
        if (!this._chart || !this._series) return;
        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX === null || centerY === null) return;
        const size = this.getSize();
        const baseVertices = [
            {
                x: 0,
                y: -size
            },
            {
                x: -size * Math.cos(Math.PI / 6),
                y: size * Math.sin(Math.PI / 6)
            },
            {
                x: size * Math.cos(Math.PI / 6),
                y: size * Math.sin(Math.PI / 6)
            }
        ];
        this._vertices = baseVertices.map(vertex => {
            const rotatedX = vertex.x * Math.cos(this._rotation) - vertex.y * Math.sin(this._rotation);
            const rotatedY = vertex.x * Math.sin(this._rotation) + vertex.y * Math.cos(this._rotation);
            return {
                x: centerX + rotatedX,
                y: centerY + rotatedY
            };
        });
    }


    private getRotationHandlePosition(): { x: number; y: number } {
        if (!this._chart || !this._series) return { x: 0, y: 0 };
        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX === null || centerY === null) return { x: 0, y: 0 };
        const handleX = centerX + this._rotationHandleDistance * Math.sin(this._rotation);
        const handleY = centerY - this._rotationHandleDistance * Math.cos(this._rotation);
        return { x: handleX, y: handleY };
    }


    dragTriangleByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const centerX = timeScale.timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX === null || centerY === null) return;
        const newCenterX = centerX + deltaX;
        const newCenterY = centerY + deltaY;
        const newCenterTime = timeScale.coordinateToTime(newCenterX);
        const newCenterPrice = this._series.coordinateToPrice(newCenterY);
        if (newCenterTime !== null && !isNaN(newCenterPrice)) {
            this._centerTime = newCenterTime as number;
            this._centerPrice = newCenterPrice;
            this.calculateVertices();
            this.requestUpdate();
        }
    }


    dragVertex(vertexIndex: number, newX: number, newY: number) {
        if (!this._chart || !this._series) return;

        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);

        if (centerX === null || centerY === null) return;


        const newSize = Math.sqrt(Math.pow(newX - centerX, 2) + Math.pow(newY - centerY, 2));
        this._pixelSize = Math.max(newSize, 10);

        this.calculateVertices();
        this.requestUpdate();
    }


    rotateTriangle(mouseX: number, mouseY: number) {
        if (!this._chart || !this._series) return;

        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);

        if (centerX === null || centerY === null) return;


        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        const newRotation = Math.atan2(deltaX, -deltaY);

        this._rotation = newRotation;
        this.calculateVertices();
        this.requestUpdate();
    }


    isPointNearHandle(x: number, y: number, threshold: number = 15): 'center' | 'vertex1' | 'vertex2' | 'vertex3' | 'rotation' | null {
        if (!this._chart || !this._series) return null;

        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);

        if (centerX == null || centerY == null) return null;


        const distToCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        if (distToCenter <= threshold) {
            return 'center';
        }


        const rotationHandle = this.getRotationHandlePosition();
        const distToRotation = Math.sqrt(Math.pow(x - rotationHandle.x, 2) + Math.pow(y - rotationHandle.y, 2));
        if (distToRotation <= threshold) {
            return 'rotation';
        }


        this.calculateVertices();
        for (let i = 0; i < this._vertices.length; i++) {
            const vertex = this._vertices[i];
            const distToVertex = Math.sqrt(Math.pow(x - vertex.x, 2) + Math.pow(y - vertex.y, 2));
            if (distToVertex <= threshold) {
                return `vertex${i + 1}` as any;
            }
        }

        return null;
    }


    getVertexPosition(vertexIndex: number): { x: number; y: number } {
        this.calculateVertices();
        return this._vertices[vertexIndex] || { x: 0, y: 0 };
    }

    private calculatePixelSize(): number {
        if (!this._chart || !this._series) return 50;

        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);

        if (centerX === null || centerY === null) return 50;

        if (this._sizeTime !== 0 || this._sizePrice !== 0) {
            try {
                let sizeX = centerX;
                let sizeY = centerY;

                if (this._sizeTime !== 0) {
                    const sizeTimePoint = this._centerTime + this._sizeTime;
                    const sizeXCoord = this._chart.timeScale().timeToCoordinate(sizeTimePoint);
                    if (sizeXCoord !== null) {
                        sizeX = sizeXCoord;
                    }
                }

                if (this._sizePrice !== 0) {
                    const sizePricePoint = this._centerPrice + this._sizePrice;
                    const sizeYCoord = this._series.priceToCoordinate(sizePricePoint);
                    if (sizeYCoord !== null) {
                        sizeY = sizeYCoord;
                    }
                }

                const size = Math.sqrt(Math.pow(sizeX - centerX, 2) + Math.pow(sizeY - centerY, 2));
                return Math.max(size, 10);
            } catch (error) {
            }
        }

        return this._pixelSize > 0 ? this._pixelSize : 50;
    }

    private getSize(): number {
        return this._pixelSize;
    }

    updatePixelSize(newPixelSize: number) {
        this._pixelSize = Math.max(newPixelSize, 10);
        this.calculateVertices();
        this.requestUpdate();
    }


    updateRotation(newRotation: number) {
        this._rotation = newRotation;
        this.calculateVertices();
        this.requestUpdate();
    }

    private requestUpdate() {
        if (this._chart && this._series) {
            try {
                this._chart.timeScale().applyOptions({});
            } catch (error) {
            }
            if (this._series._internal__dataChanged) {
                this._series._internal__dataChanged();
            }
            if (this._chart._internal__paneUpdate) {
                this._chart._internal__paneUpdate();
            }
        }
    }

    time() {
        return this._centerTime;
    }

    priceValue() {
        return this._centerPrice;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;

                    this.calculateVertices();
                    if (this._vertices.length !== 3) return;

                    ctx.save();
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.lineCap = 'round';

                    if (this._isPreview || this._isDragging) {
                        ctx.globalAlpha = 0.7;
                    } else {
                        ctx.globalAlpha = 1.0;
                    }

                    if (this._isPreview || this._isDragging) {
                        ctx.setLineDash([5, 3]);
                    } else {
                        switch (this._lineStyle) {
                            case 'dashed':
                                ctx.setLineDash([5, 3]);
                                break;
                            case 'dotted':
                                ctx.setLineDash([2, 2]);
                                break;
                            case 'solid':
                            default:
                                ctx.setLineDash([]);
                                break;
                        }
                    }


                    ctx.beginPath();
                    ctx.moveTo(this._vertices[0].x, this._vertices[0].y);
                    ctx.lineTo(this._vertices[1].x, this._vertices[1].y);
                    ctx.lineTo(this._vertices[2].x, this._vertices[2].y);
                    ctx.closePath();

                    if (!this._isPreview) {
                        ctx.fillStyle = this._fillColor;
                        ctx.fill();
                    }

                    ctx.stroke();


                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const drawHandle = (x: number, y: number, isActive: boolean = false, isRotation: boolean = false) => {
                            ctx.save();

                            if (isRotation) {

                                ctx.fillStyle = '#FF4444';
                                ctx.strokeStyle = '#FFFFFF';
                            } else {

                                ctx.fillStyle = this._color;
                                ctx.strokeStyle = '#FFFFFF';
                            }

                            ctx.beginPath();
                            ctx.arc(x, y, 6, 0, Math.PI * 2);
                            ctx.fill();


                            ctx.lineWidth = 2;
                            ctx.stroke();

                            if (isActive) {

                                ctx.strokeStyle = isRotation ? '#FF4444' : this._color;
                                ctx.lineWidth = 1;
                                ctx.setLineDash([]);
                                ctx.beginPath();
                                ctx.arc(x, y, 10, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            ctx.restore();
                        };

                        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
                        const centerY = this._series.priceToCoordinate(this._centerPrice);

                        if (centerX !== null && centerY !== null) {

                            drawHandle(centerX, centerY, this._dragPoint === 'center');


                            const rotationHandle = this.getRotationHandlePosition();
                            drawHandle(rotationHandle.x, rotationHandle.y, this._dragPoint === 'rotation', true);


                            this._vertices.forEach((vertex, index) => {
                                const isActive = this._dragPoint === `vertex${index + 1}`;
                                drawHandle(vertex.x, vertex.y, isActive);
                            });


                            if (this._showHandles) {
                                ctx.save();
                                ctx.strokeStyle = '#FF4444';
                                ctx.lineWidth = 1;
                                ctx.setLineDash([2, 2]);
                                ctx.beginPath();
                                ctx.moveTo(centerX, centerY);
                                ctx.lineTo(rotationHandle.x, rotationHandle.y);
                                ctx.stroke();
                                ctx.restore();
                            }
                        }
                    }

                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getCenterTime(): number {
        return this._centerTime;
    }

    getCenterPrice(): number {
        return this._centerPrice;
    }

    getSizeTime(): number {
        return this._sizeTime;
    }

    getSizePrice(): number {
        return this._sizePrice;
    }

    getPixelSize(): number {
        return this._pixelSize;
    }

    getRotation(): number {
        return this._rotation;
    }

    getVertices(): { x: number, y: number }[] {
        return [...this._vertices];
    }

    updateColor(color: string) {
        this._color = color;
        this._fillColor = this.hexToRGBA(color, 0.2);
        this.requestUpdate();
    }

    updateLineWidth(lineWidth: number) {
        this._lineWidth = lineWidth;
        this.requestUpdate();
    }

    updateLineStyle(lineStyle: "solid" | "dashed" | "dotted"): void {
        this._lineStyle = lineStyle;
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        lineWidth?: number;
        lineStyle?: 'solid' | 'dashed' | 'dotted';
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            rotation: this._rotation,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        this.calculateVertices();
        if (this._vertices.length !== 3) return null;
        const minX = Math.min(...this._vertices.map(v => v.x));
        const maxX = Math.max(...this._vertices.map(v => v.x));
        const minY = Math.min(...this._vertices.map(v => v.y));
        const maxY = Math.max(...this._vertices.map(v => v.y));
        const centerX = this._chart.timeScale().timeToCoordinate(this._centerTime);
        const centerY = this._series.priceToCoordinate(this._centerPrice);
        if (centerX == null || centerY == null) return null;
        return {
            centerX, centerY,
            minX, maxX, minY, maxY,
            vertices: this._vertices,
            rotation: this._rotation
        };
    }

    isPointInTriangle(x: number, y: number): boolean {
        this.calculateVertices();
        if (this._vertices.length !== 3) return false;
        const v0 = this._vertices[0];
        const v1 = this._vertices[1];
        const v2 = this._vertices[2];
        const area = 0.5 * (-v1.y * v2.x + v0.y * (-v1.x + v2.x) + v0.x * (v1.y - v2.y) + v1.x * v2.y);
        const s = 1 / (2 * area) * (v0.y * v2.x - v0.x * v2.y + (v2.y - v0.y) * x + (v0.x - v2.x) * y);
        const t = 1 / (2 * area) * (v0.x * v1.y - v0.y * v1.x + (v0.y - v1.y) * x + (v1.x - v0.x) * y);
        return s >= 0 && t >= 0 && (1 - s - t) >= 0;
    }

    isPointNearEdge(x: number, y: number, threshold: number = 5): boolean {
        this.calculateVertices();
        if (this._vertices.length !== 3) return false;


        const edges = [
            [this._vertices[0], this._vertices[1]],
            [this._vertices[1], this._vertices[2]],
            [this._vertices[2], this._vertices[0]]
        ];

        for (const [p1, p2] of edges) {
            const distance = this.pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
            if (distance <= threshold) {
                return true;
            }
        }

        return false;
    }

    private pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;

        return Math.sqrt(dx * dx + dy * dy);
    }
}