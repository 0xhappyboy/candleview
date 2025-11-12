import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class GannRectangleMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _startTime: string;
    private _startPrice: number;
    private _endTime: string;
    private _endPrice: number;
    private _renderer: any;
    private _color: string;
    private _lineWidth: number;
    private _lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';
    private _isPreview: boolean;
    private _isDragging: boolean = false;
    private _dragPoint: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | null = null;
    private _showHandles: boolean = false;
    private markType: MarkType = MarkType.GannRectangle;
    private _gridLines: number = 6;
    private _outerMarginRatio: number = 0.03;
    private _fanLineCount: number = 3;
    private _fanLineColors: string[] = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
    private _fanLineWidth: number = 2;
    private _fanColor: string = 'rgba(255, 107, 107, 0.1)';
    private _fanBorderColor: string = 'rgba(255, 107, 107, 0.3)';
    private _fanAngles: number[] = [Math.PI / 4 - Math.PI / 6, Math.PI / 4, Math.PI / 4 + Math.PI / 6];
    private _lineColors: string[] = [
        '#E0E0E0', '#E0E0E0', '#E0E0E0', '#E0E0E0', '#E0E0E0'
    ];
    private _fillColors: string[] = [
        'rgba(224, 224, 224, 0.05)', 'rgba(224, 224, 224, 0.05)', 'rgba(224, 224, 224, 0.05)',
        'rgba(224, 224, 224, 0.05)', 'rgba(224, 224, 224, 0.05)', 'rgba(224, 224, 224, 0.05)'
    ];
    private _showLabels: boolean = true;
    private _labelFont: string = '11px Arial';
    private _labelColor: string = '#2C3E50';
    private _labelBackground: string = 'rgba(255, 255, 255, 0.9)';
    private _isDarkTheme: boolean = false;

    constructor(
        startTime: string,
        startPrice: number,
        endTime: string,
        endPrice: number,
        color: string = '#2962FF',
        lineWidth: number = 2,
        isPreview: boolean = false
    ) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this._endTime = endTime;
        this._endPrice = endPrice;
        this._color = color;
        this._lineWidth = lineWidth;
        this._isPreview = isPreview;

        this.generateFanLineColors(color);
    }

    getMarkType(): MarkType {
        return this.markType;
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this.requestUpdate();
    }

    updateAllViews() { }

    updateStartPoint(startTime: string, startPrice: number) {
        this._startTime = startTime;
        this._startPrice = startPrice;
        this.requestUpdate();
    }

    updateEndPoint(endTime: string, endPrice: number) {
        this._endTime = endTime;
        this._endPrice = endPrice;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this._isPreview = isPreview;
        this.requestUpdate();
    }

    setDragging(isDragging: boolean, dragPoint: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | null = null) {
        this._isDragging = isDragging;
        this._dragPoint = dragPoint;
        this.requestUpdate();
    }

    setShowHandles(show: boolean) {
        this._showHandles = show;
        this.requestUpdate();
    }

    private getControlPoints() {
        if (!this._chart || !this._series) {
            return { startX: 0, startY: 0, endX: 0, endY: 0 };
        }
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = timeScale.timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (startX === null || startY === null || endX === null || endY === null) {
            return { startX: 0, startY: 0, endX: 0, endY: 0 };
        }
        return { startX, startY, endX, endY };
    }

    private getActualBoxCorners() {
        const { startX, startY, endX, endY } = this.getControlPoints();
        if (startX === 0 && startY === 0 && endX === 0 && endY === 0) {
            return { left: 0, right: 0, top: 0, bottom: 0 };
        }
        const left = Math.min(startX, endX);
        const right = Math.max(startX, endX);
        const top = Math.min(startY, endY);
        const bottom = Math.max(startY, endY);
        return {
            left: left,
            right: right,
            top: top,
            bottom: bottom
        };
    }

    private getCornerHandlePositions() {
        const corners = this.getActualBoxCorners();
        return {
            topLeft: { x: corners.left, y: corners.top },
            topRight: { x: corners.right, y: corners.top },
            bottomLeft: { x: corners.left, y: corners.bottom },
            bottomRight: { x: corners.right, y: corners.bottom }
        };
    }

    private drawGannRectangle(ctx: CanvasRenderingContext2D) {
        const corners = this.getActualBoxCorners();
        if (corners.left === 0 && corners.right === 0 && corners.top === 0 && corners.bottom === 0) return;
        const rectWidth = corners.right - corners.left;
        const rectHeight = corners.bottom - corners.top;
        const outerMargin = Math.max(rectWidth, rectHeight) * this._outerMarginRatio;
        const drawLeft = corners.left - outerMargin;
        const drawRight = corners.right + outerMargin;
        const drawTop = corners.top - outerMargin;
        const drawBottom = corners.bottom + outerMargin;
        const gridLeft = drawLeft + outerMargin;
        const gridTop = drawTop + outerMargin;
        const gridRight = drawRight - outerMargin;
        const gridBottom = drawBottom - outerMargin;
        const gridWidth = gridRight - gridLeft;
        const gridHeight = gridBottom - gridTop;
        const cellWidth = gridWidth / (this._gridLines - 1);
        const cellHeight = gridHeight / (this._gridLines - 1);
        ctx.save();
        if (!this._isPreview) {
            this.drawGridFills(ctx, gridLeft, gridTop, cellWidth, cellHeight);
        }
        this.drawGridLines(ctx, gridLeft, gridTop, cellWidth, cellHeight);
        this.drawQuarterCircleFan(ctx, gridLeft, gridBottom, gridRight, gridTop);
        this.drawGannFanLines(ctx, gridLeft, gridBottom, gridRight, gridTop);
        this.drawOuterBorder(ctx, gridLeft, gridTop, gridRight, gridBottom);
        if (this._showLabels && !this._isPreview) {
            this.drawLabels(ctx, corners.left, corners.top, corners.right, corners.bottom,
                gridLeft, gridTop, cellWidth, cellHeight);
        }
        ctx.restore();
    }

    private drawGridFills(ctx: CanvasRenderingContext2D, gridLeft: number, gridTop: number, cellWidth: number, cellHeight: number) {
        for (let row = 0; row < this._gridLines - 1; row++) {
            for (let col = 0; col < this._gridLines - 1; col++) {
                const x = gridLeft + col * cellWidth;
                const y = gridTop + row * cellHeight;
                ctx.save();
                ctx.fillStyle = this._fillColors[(row + col) % this._fillColors.length];
                ctx.fillRect(x, y, cellWidth, cellHeight);
                ctx.restore();
            }
        }
    }

    private drawGridLines(ctx: CanvasRenderingContext2D, gridLeft: number, gridTop: number, cellWidth: number, cellHeight: number) {
        ctx.save();
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 1;
        ctx.globalAlpha = this._isPreview || this._isDragging ? 0.4 : 0.6;
        this.setLineStyle(ctx, 'solid');
        for (let i = 0; i < this._gridLines; i++) {
            const x = gridLeft + i * cellWidth;
            ctx.beginPath();
            ctx.moveTo(x, gridTop);
            ctx.lineTo(x, gridTop + (this._gridLines - 1) * cellHeight);
            ctx.stroke();
        }
        for (let i = 0; i < this._gridLines; i++) {
            const y = gridTop + i * cellHeight;
            ctx.beginPath();
            ctx.moveTo(gridLeft, y);
            ctx.lineTo(gridLeft + (this._gridLines - 1) * cellWidth, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    private drawOuterBorder(ctx: CanvasRenderingContext2D, left: number, top: number, right: number, bottom: number) {
        ctx.save();
        ctx.strokeStyle = this._color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = this._isPreview || this._isDragging ? 0.8 : 1.0;
        this.setLineStyle(ctx, this._lineStyle);
        ctx.strokeRect(left, top, right - left, bottom - top);
        ctx.restore();
    }

    private drawQuarterCircleFan(ctx: CanvasRenderingContext2D, left: number, bottom: number, right: number, top: number) {
        const centerX = left;
        const centerY = bottom;
        const radiusX = right - left;
        const radiusY = bottom - top;
        ctx.save();
        ctx.globalAlpha = this._isPreview || this._isDragging ? 0.4 : 0.5;
        const arcBorderColors = [
            '#FF4444',
            '#00c200ff',
            '#4444FF',
            '#a3a300ff'
        ];
        const arcFillColors = [
            'rgba(255, 68, 68, 0.3)',
            'rgba(68, 255, 68, 0.25)',
            'rgba(68, 68, 255, 0.25)',
            'rgba(255, 255, 68, 0.2)'
        ];
        const arcCount = 4;
        for (let i = 0; i < arcCount; i++) {
            const scale = (i + 1) / (arcCount + 1);
            const currentRadiusX = radiusX * scale;
            const currentRadiusY = radiusY * scale;
            ctx.fillStyle = arcFillColors[i];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.ellipse(centerX, centerY, currentRadiusX, currentRadiusY, 0, 0, -Math.PI / 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = arcBorderColors[i];
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, currentRadiusX, currentRadiusY, 0, 0, -Math.PI / 2, true);
            ctx.stroke();
        }
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, -Math.PI / 2, true);
        ctx.lineTo(centerX, centerY);
        ctx.stroke();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.restore();
    }

    private drawGannFanLines(ctx: CanvasRenderingContext2D, left: number, bottom: number, right: number, top: number) {
        const originX = left;
        const originY = bottom;
        const width = right - left;
        const height = bottom - top;
        const diagonalAngle = -Math.atan2(height, width);
        const minAngle = -Math.atan2(height, 0.1);
        const maxAngle = -Math.atan2(0.1, width);
        const clampedDiagonalAngle = Math.max(minAngle, Math.min(maxAngle, diagonalAngle));
        const availableRange = Math.min(
            Math.abs(clampedDiagonalAngle - minAngle),
            Math.abs(maxAngle - clampedDiagonalAngle)
        );
        const angleOffset = Math.min(Math.PI / 9, availableRange * 0.8);
        const angles = [
            clampedDiagonalAngle - angleOffset,
            clampedDiagonalAngle,
            clampedDiagonalAngle + angleOffset
        ];
        ctx.save();
        ctx.globalAlpha = this._isPreview || this._isDragging ? 0.7 : 0.9;
        this.setLineStyle(ctx, 'solid');
        for (let i = 0; i < angles.length; i++) {
            const angle = angles[i];
            const color = this._fanLineColors[i % this._fanLineColors.length];
            ctx.strokeStyle = color;
            ctx.lineWidth = this._fanLineWidth;
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            let endX, endY;
            const intersectionWithRight = originY + (right - originX) * Math.tan(angle);
            const intersectionWithTop = originX + (top - originY) / Math.tan(angle);
            if (intersectionWithRight >= top && intersectionWithRight <= bottom) {
                endX = right;
                endY = intersectionWithRight;
            }
            else if (intersectionWithTop >= left && intersectionWithTop <= right) {
                endX = intersectionWithTop;
                endY = top;
            }
            else {
                endX = right;
                endY = top;
            }
            ctx.lineTo(endX, endY);
            ctx.stroke();
            if (this._showLabels && !this._isPreview) {
                const degrees = Math.round(angle * 180 / Math.PI);
                const labelDistance = Math.sqrt(Math.pow(endX - originX, 2) + Math.pow(endY - originY, 2)) * 0.5;
                const labelX = originX + labelDistance * Math.cos(angle);
                const labelY = originY + labelDistance * Math.sin(angle);
                ctx.save();
                ctx.fillStyle = this._labelColor;
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${degrees}°`, labelX, labelY);
                ctx.restore();
            }
        }
        ctx.restore();
    }

    private setLineStyle(ctx: CanvasRenderingContext2D, style: 'solid' | 'dashed' | 'dotted') {
        switch (style) {
            case 'dashed': ctx.setLineDash([5, 3]); break;
            case 'dotted': ctx.setLineDash([2, 2]); break;
            default: ctx.setLineDash([]); break;
        }
    }

    private drawLabels(
        ctx: CanvasRenderingContext2D,
        boxLeft: number, boxTop: number, boxRight: number, boxBottom: number,
        gridLeft: number, gridTop: number, cellWidth: number, cellHeight: number
    ) {
        const timeScale = this._chart.timeScale();
        ctx.save();
        ctx.font = this._labelFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < this._gridLines; i++) {
            const y = gridTop + i * cellHeight;
            const price = this._series.coordinateToPrice(y);
            if (!isNaN(price)) {
                this.drawSingleLabel(ctx, boxLeft - 3, y, price.toFixed(2), 'left');
                this.drawSingleLabel(ctx, boxRight + 3, y, price.toFixed(2), 'right');
            }
        }
        for (let i = 0; i < this._gridLines; i++) {
            const x = gridLeft + i * cellWidth;
            const time = timeScale.coordinateToTime(x);
            if (time) {
                const date = new Date(time);
                const timeStr = `${date.getMonth() + 1}/${date.getDate()}`;
                this.drawSingleLabel(ctx, x, boxTop - 3, timeStr, 'top');
                this.drawSingleLabel(ctx, x, boxBottom + 3, timeStr, 'bottom');
            }
        }
        ctx.restore();
    }

    private drawSingleLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, position: 'left' | 'right' | 'top' | 'bottom') {
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = 14;
        ctx.save();
        ctx.fillStyle = this._labelBackground;
        const padding = 2;
        let bgX = x;
        let bgY = y;
        let textX = x;
        let textY = y;
        switch (position) {
            case 'left':
                bgX = x - textWidth - padding;
                bgY = y - textHeight / 2;
                textX = x - padding - 1;
                ctx.textAlign = 'right';
                break;
            case 'right':
                bgX = x + padding;
                bgY = y - textHeight / 2;
                textX = x + padding + 1;
                ctx.textAlign = 'left';
                break;
            case 'top':
                bgX = x - textWidth / 2;
                bgY = y - textHeight - padding;
                textY = y - padding - 1;
                ctx.textAlign = 'center';
                break;
            case 'bottom':
                bgX = x - textWidth / 2;
                bgY = y + padding;
                textY = y + padding + 8;
                ctx.textAlign = 'center';
                break;
        }
        this.drawRoundedRect(ctx, bgX - 1, bgY - 1, textWidth + 2, textHeight + 2, 2);
        ctx.fillStyle = this._labelColor;
        ctx.font = this._labelFont;
        ctx.fillText(text, textX, textY);
        ctx.restore();
    }

    private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    private drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number, isActive: boolean = false) {
        ctx.save();
        ctx.fillStyle = '#007AFF';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        if (isActive) {
            ctx.strokeStyle = '#007AFF';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }

    private requestUpdate() {
        if (this._chart && this._series) {
            try {
                this._chart.timeScale().applyOptions({});
            } catch (error) {
                console.log('Apply options method not available');
            }
            if (this._series._internal__dataChanged) {
                this._series._internal__dataChanged();
            }
            if (this._chart._internal__paneUpdate) {
                this._chart._internal__paneUpdate();
            }
        }
    }


    isPointNearHandle(x: number, y: number, threshold: number = 15): 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | null {
        const handlePositions = this.getCornerHandlePositions();
        const distances = {
            topLeft: Math.sqrt(Math.pow(x - handlePositions.topLeft.x, 2) + Math.pow(y - handlePositions.topLeft.y, 2)),
            topRight: Math.sqrt(Math.pow(x - handlePositions.topRight.x, 2) + Math.pow(y - handlePositions.topRight.y, 2)),
            bottomLeft: Math.sqrt(Math.pow(x - handlePositions.bottomLeft.x, 2) + Math.pow(y - handlePositions.bottomLeft.y, 2)),
            bottomRight: Math.sqrt(Math.pow(x - handlePositions.bottomRight.x, 2) + Math.pow(y - handlePositions.bottomRight.y, 2))
        };
        let closestHandle: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | null = null;
        let minDistance = threshold;
        for (const [handle, distance] of Object.entries(distances)) {
            if (distance <= minDistance) {
                minDistance = distance;
                closestHandle = handle as 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
            }
        }
        return closestHandle;
    }

    time(): string {
        return this._startTime;
    }

    priceValue(): number {
        return this._startPrice;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    ctx.save();
                    this.drawGannRectangle(ctx);
                    if ((this._showHandles || this._isDragging) && !this._isPreview) {
                        const handlePositions = this.getCornerHandlePositions();
                        this.drawHandle(ctx, handlePositions.topLeft.x, handlePositions.topLeft.y, this._dragPoint === 'topLeft');
                        this.drawHandle(ctx, handlePositions.topRight.x, handlePositions.topRight.y, this._dragPoint === 'topRight');
                        this.drawHandle(ctx, handlePositions.bottomLeft.x, handlePositions.bottomLeft.y, this._dragPoint === 'bottomLeft');
                        this.drawHandle(ctx, handlePositions.bottomRight.x, handlePositions.bottomRight.y, this._dragPoint === 'bottomRight');
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    setGridLines(count: number): void {
        this._gridLines = count + 1;
        this.requestUpdate();
    }

    setOuterMarginRatio(ratio: number): void {
        this._outerMarginRatio = ratio;
        this.requestUpdate();
    }

    setLineColors(colors: string[]): void {
        this._lineColors = colors;
        this.requestUpdate();
    }

    setFillColors(colors: string[]): void {
        this._fillColors = colors;
        this.requestUpdate();
    }

    setShowLabels(show: boolean): void {
        this._showLabels = show;
        this.requestUpdate();
    }

    setTheme(isDark: boolean) {
        this._isDarkTheme = isDark;
        this._labelColor = isDark ? '#ECF0F1' : '#2C3E50';
        this._labelBackground = isDark ? 'rgba(44, 62, 80, 0.95)' : 'rgba(255, 255, 255, 0.95)';
        this.requestUpdate();
    }

    updateColor(color: string) {
        this._color = color;
        this.generateFanLineColors(color);
        this.requestUpdate();
    }

    private generateFanLineColors(baseColor: string) {
        this._fanLineColors = [
            baseColor,
            this.adjustColorBrightness(baseColor, 0.3),
            this.adjustColorBrightness(baseColor, -0.3)
        ];
        this._fanColor = this.hexToRgba(baseColor, 0.1);
        this._fanBorderColor = this.hexToRgba(baseColor, 0.3);
    }

    private hexToRgba(hex: string, alpha: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    private adjustColorBrightness(color: string, factor: number): string {
        if (color.startsWith('#')) {
            let r = parseInt(color.slice(1, 3), 16);
            let g = parseInt(color.slice(3, 5), 16);
            let b = parseInt(color.slice(5, 7), 16);
            r = Math.min(255, Math.max(0, r + Math.round(r * factor)));
            g = Math.min(255, Math.max(0, g + Math.round(g * factor)));
            b = Math.min(255, Math.max(0, b + Math.round(b * factor)));
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }
        return color;
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
        gridLines?: number;
        outerMarginRatio?: number;
        lineColors?: string[];
        fillColors?: string[];
        showLabels?: boolean;
        isDarkTheme?: boolean;
        fanLineCount?: number;
        fanLineWidth?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.gridLines !== undefined) this.setGridLines(styles.gridLines);
        if (styles.outerMarginRatio !== undefined) this.setOuterMarginRatio(styles.outerMarginRatio);
        if (styles.lineColors) this.setLineColors(styles.lineColors);
        if (styles.fillColors) this.setFillColors(styles.fillColors);
        if (styles.showLabels !== undefined) this.setShowLabels(styles.showLabels);
        if (styles.isDarkTheme !== undefined) this.setTheme(styles.isDarkTheme);
        if (styles.fanLineCount !== undefined) this._fanLineCount = styles.fanLineCount;
        if (styles.fanLineWidth !== undefined) this._fanLineWidth = styles.fanLineWidth;
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            gridLines: this._gridLines - 1,
            outerMarginRatio: this._outerMarginRatio,
            lineColors: this._lineColors,
            fillColors: this._fillColors,
            showLabels: this._showLabels,
            isDarkTheme: this._isDarkTheme,
            fanLineCount: this._fanLineCount,
            fanLineWidth: this._fanLineWidth,
        };
    }

    getBounds() {
        const corners = this.getActualBoxCorners();
        return {
            topLeftX: corners.left,
            topLeftY: corners.top,
            topRightX: corners.right,
            topRightY: corners.top,
            bottomLeftX: corners.left,
            bottomLeftY: corners.bottom,
            bottomRightX: corners.right,
            bottomRightY: corners.bottom,
            minX: corners.left,
            maxX: corners.right,
            minY: corners.top,
            maxY: corners.bottom
        };
    }

    isPointInBounds(x: number, y: number, threshold: number = 15): boolean {
        const bounds = this.getBounds();
        if (!bounds) return false;
        return x >= bounds.minX - threshold && x <= bounds.maxX + threshold &&
            y >= bounds.minY - threshold && y <= bounds.maxY + threshold;
    }

    dragGannBoxByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const startX = timeScale.timeToCoordinate(this._startTime);
        const startY = this._series.priceToCoordinate(this._startPrice);
        const endX = timeScale.timeToCoordinate(this._endTime);
        const endY = this._series.priceToCoordinate(this._endPrice);
        if (startX === null || startY === null || endX === null || endY === null) return;
        const newStartX = startX + deltaX;
        const newStartY = startY + deltaY;
        const newEndX = endX + deltaX;
        const newEndY = endY + deltaY;
        const newStartTime = timeScale.coordinateToTime(newStartX);
        const newStartPrice = this._series.coordinateToPrice(newStartY);
        const newEndTime = timeScale.coordinateToTime(newEndX);
        const newEndPrice = this._series.coordinateToPrice(newEndY);
        if (newStartTime !== null && !isNaN(newStartPrice) &&
            newEndTime !== null && !isNaN(newEndPrice)) {
            this._startTime = newStartTime.toString();
            this._startPrice = newStartPrice;
            this._endTime = newEndTime.toString();
            this._endPrice = newEndPrice;
            this.requestUpdate();
        }
    }

    updateByCornerDrag(corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', time: string, price: number) {
        if (!this._chart || !this._series) return;
        let newStartTime = this._startTime;
        let newStartPrice = this._startPrice;
        let newEndTime = this._endTime;
        let newEndPrice = this._endPrice;
        switch (corner) {
            case 'topLeft':
                newStartTime = time;
                newStartPrice = price;
                break;
            case 'topRight':
                newEndTime = time;
                newStartPrice = price;
                break;
            case 'bottomLeft':
                newStartTime = time;
                newEndPrice = price;
                break;
            case 'bottomRight':
                newEndTime = time;
                newEndPrice = price;
                break;
        }
        this._startTime = newStartTime;
        this._startPrice = newStartPrice;
        this._endTime = newEndTime;
        this._endPrice = newEndPrice;
        this.requestUpdate();
    }
}