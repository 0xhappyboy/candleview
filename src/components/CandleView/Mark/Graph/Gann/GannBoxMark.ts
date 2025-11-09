
import { MarkType } from "../../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class GannBoxMark implements IGraph, IGraphStyle {
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
    private markType: MarkType = MarkType.GannBox;

    
    private _gridLines: number = 7; 
    private _outerMarginRatio: number = 0.03;
    private _edgeCellRatio: number = 0.25;

    
    private _lineColors: string[] = [
        '#FF3B30', '#4CD964', '#007AFF', '#5856D6', '#FF2D55',
        '#FF9500', '#FFCC00', '#5AC8FA', '#AF52DE', '#FF3B30',
        '#34C759', '#007AFF', '#5856D6', '#FF2D55', '#FF9500',
        '#FFCC00', '#5AC8FA', '#AF52DE', '#FF3B30', '#34C759'
    ];

    
    private _fillColors: string[] = [
        'rgba(255, 59, 48, 0.15)', 'rgba(76, 217, 100, 0.15)', 'rgba(0, 122, 255, 0.15)',
        'rgba(88, 86, 214, 0.15)', 'rgba(255, 45, 85, 0.15)', 'rgba(255, 149, 0, 0.15)',
        'rgba(255, 204, 0, 0.15)', 'rgba(90, 200, 250, 0.15)', 'rgba(175, 82, 222, 0.15)',
        'rgba(255, 59, 48, 0.15)', 'rgba(52, 199, 89, 0.15)', 'rgba(0, 122, 255, 0.15)',
        'rgba(88, 86, 214, 0.15)', 'rgba(255, 45, 85, 0.15)', 'rgba(255, 149, 0, 0.15)',
        'rgba(255, 204, 0, 0.15)', 'rgba(90, 200, 250, 0.15)', 'rgba(175, 82, 222, 0.15)',
        'rgba(255, 59, 48, 0.15)', 'rgba(52, 199, 89, 0.15)', 'rgba(0, 122, 255, 0.15)',
        'rgba(88, 86, 214, 0.15)', 'rgba(255, 45, 85, 0.15)', 'rgba(255, 149, 0, 0.15)',
        'rgba(255, 204, 0, 0.15)'
    ];

    
    private _showLabels: boolean = true;
    private _labelFont: string = '11px Arial';
    private _labelColor: string = '#2C3E50';
    private _labelBackground: string = 'rgba(255, 255, 255, 0.95)';
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

    private drawGannBox(ctx: CanvasRenderingContext2D) {
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

        
        const cellWidths = this.calculateUnequalCellSizes(this._gridLines, gridWidth, this._edgeCellRatio);
        const cellHeights = this.calculateUnequalCellSizes(this._gridLines, gridHeight, this._edgeCellRatio);

        ctx.save();

        
        if (!this._isPreview) {
            this.drawGridFills(ctx, gridLeft, gridTop, cellWidths, cellHeights);
        }

        
        this.drawGridLines(ctx, gridLeft, gridTop, cellWidths, cellHeights);

        
        if (this._showLabels && !this._isPreview) {
            this.drawLabels(ctx, corners.left, corners.top, corners.right, corners.bottom,
                gridLeft, gridTop, cellWidths, cellHeights);
        }

        ctx.restore();
    }

    private calculateUnequalCellSizes(gridLines: number, totalSize: number, edgeRatio: number): number[] {
        const sizes: number[] = [];
        const edgeSize = totalSize * edgeRatio;
        const innerSize = totalSize - 2 * edgeSize;
        const innerCellSize = innerSize / (gridLines - 2);

        for (let i = 0; i < gridLines - 1; i++) {
            if (i === 0 || i === gridLines - 2) {
                sizes.push(edgeSize);
            } else {
                sizes.push(innerCellSize);
            }
        }

        return sizes;
    }

    private drawGridFills(ctx: CanvasRenderingContext2D, gridLeft: number, gridTop: number, cellWidths: number[], cellHeights: number[]) {
        let fillIndex = 0;

        for (let row = 0; row < this._gridLines - 1; row++) {
            for (let col = 0; col < this._gridLines - 1; col++) {
                const x = gridLeft + cellWidths.slice(0, col).reduce((sum, width) => sum + width, 0);
                const y = gridTop + cellHeights.slice(0, row).reduce((sum, height) => sum + height, 0);

                ctx.save();
                ctx.fillStyle = this._fillColors[fillIndex % this._fillColors.length];
                ctx.fillRect(x, y, cellWidths[col], cellHeights[row]);
                ctx.restore();

                fillIndex++;
            }
        }
    }

    private drawGridLines(ctx: CanvasRenderingContext2D, gridLeft: number, gridTop: number, cellWidths: number[], cellHeights: number[]) {
        const verticalPositions = [gridLeft];
        const horizontalPositions = [gridTop];
        for (let i = 0; i < cellWidths.length; i++) {
            verticalPositions.push(verticalPositions[i] + cellWidths[i]);
        }
        for (let i = 0; i < cellHeights.length; i++) {
            horizontalPositions.push(horizontalPositions[i] + cellHeights[i]);
        }
        for (let i = 1; i < this._gridLines - 1; i++) {
            const x = verticalPositions[i];
            const color = this._lineColors[(i - 1) % this._lineColors.length];
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = this._lineWidth;
            ctx.globalAlpha = this._isPreview || this._isDragging ? 0.8 : 1.0;
            this.setLineStyle(ctx, this._lineStyle);
            ctx.beginPath();
            ctx.moveTo(x, horizontalPositions[0]);
            ctx.lineTo(x, horizontalPositions[horizontalPositions.length - 1]);
            ctx.stroke();
            ctx.restore();
        }
        for (let i = 1; i < this._gridLines - 1; i++) {
            const y = horizontalPositions[i];
            const color = this._lineColors[(i + this._gridLines - 2) % this._lineColors.length];
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = this._lineWidth;
            ctx.globalAlpha = this._isPreview || this._isDragging ? 0.8 : 1.0;
            this.setLineStyle(ctx, this._lineStyle);
            ctx.beginPath();
            ctx.moveTo(verticalPositions[0], y);
            ctx.lineTo(verticalPositions[verticalPositions.length - 1], y);
            ctx.stroke();
            ctx.restore();
        }
        ctx.save();
        ctx.strokeStyle = '#007AFF';
        ctx.lineWidth = 2;
        ctx.globalAlpha = this._isPreview || this._isDragging ? 0.9 : 1.0;
        this.setLineStyle(ctx, this._lineStyle);
        ctx.strokeRect(
            verticalPositions[0],
            horizontalPositions[0],
            verticalPositions[verticalPositions.length - 1] - verticalPositions[0],
            horizontalPositions[horizontalPositions.length - 1] - horizontalPositions[0]
        );
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
        gridLeft: number, gridTop: number, cellWidths: number[], cellHeights: number[]
    ) {
        const timeScale = this._chart.timeScale();
        const verticalPositions = [gridLeft];
        const horizontalPositions = [gridTop];
        for (let i = 0; i < cellWidths.length; i++) {
            verticalPositions.push(verticalPositions[i] + cellWidths[i]);
        }
        for (let i = 0; i < cellHeights.length; i++) {
            horizontalPositions.push(horizontalPositions[i] + cellHeights[i]);
        }
        ctx.save();
        ctx.font = this._labelFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < this._gridLines; i++) {
            const y = horizontalPositions[i];
            const price = this._series.coordinateToPrice(y);
            if (!isNaN(price)) {
                this.drawSingleLabel(ctx, boxLeft - 3, y, price.toFixed(4), 'left');
                this.drawSingleLabel(ctx, boxRight + 3, y, price.toFixed(4), 'right');
            }
        }
        for (let i = 0; i < this._gridLines; i++) {
            const x = verticalPositions[i];
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
                    this.drawGannBox(ctx);
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

    setEdgeCellRatio(ratio: number): void {
        this._edgeCellRatio = ratio;
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
        this.generateColorVariations(color);
        this.requestUpdate();
    }

    private generateColorVariations(baseColor: string) {
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
        edgeCellRatio?: number;
        lineColors?: string[];
        fillColors?: string[];
        showLabels?: boolean;
        isDarkTheme?: boolean;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
        if (styles.lineStyle) this.updateLineStyle(styles.lineStyle);
        if (styles.gridLines !== undefined) this.setGridLines(styles.gridLines);
        if (styles.outerMarginRatio !== undefined) this.setOuterMarginRatio(styles.outerMarginRatio);
        if (styles.edgeCellRatio !== undefined) this.setEdgeCellRatio(styles.edgeCellRatio);
        if (styles.lineColors) this.setLineColors(styles.lineColors);
        if (styles.fillColors) this.setFillColors(styles.fillColors);
        if (styles.showLabels !== undefined) this.setShowLabels(styles.showLabels);
        if (styles.isDarkTheme !== undefined) this.setTheme(styles.isDarkTheme);
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            lineWidth: this._lineWidth,
            lineStyle: this._lineStyle,
            gridLines: this._gridLines - 1,
            outerMarginRatio: this._outerMarginRatio,
            edgeCellRatio: this._edgeCellRatio,
            lineColors: this._lineColors,
            fillColors: this._fillColors,
            showLabels: this._showLabels,
            isDarkTheme: this._isDarkTheme,
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