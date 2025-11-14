import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class BubbleBoxMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _controlPointTime: string;
    private _controlPointPrice: number;
    private _bubbleTime: string;
    private _bubblePrice: number;
    private _renderer: any;
    private _color: string;
    private _backgroundColor: string;
    private _textColor: string;
    private _fontSize: number;
    private _lineWidth: number;
    private _text: string;
    private _isDraggingControlPoint: boolean = false;
    private _isDraggingBubble: boolean = false;
    private markType: MarkType = MarkType.BubbleBox;
    private _isEditing = false;
    private _editInput: HTMLTextAreaElement | null = null;
    private _isSelected = false;
    private _isHovered = false;
    private _lastHoverState = false;
    private _originalText: string = '';
    private _cursorVisible = true;
    private _cursorTimer: number | null = null;

    constructor(
        controlPointTime: string,
        controlPointPrice: number,
        bubbleTime: string,
        bubblePrice: number,
        text: string = '',
        color: string = '#2962FF',
        backgroundColor: string = 'rgba(41, 98, 255)',
        textColor: string = '#FFFFFF',
        fontSize: number = 12,
        lineWidth: number = 1,
    ) {
        this._controlPointTime = controlPointTime;
        this._controlPointPrice = controlPointPrice;
        this._bubbleTime = bubbleTime;
        this._bubblePrice = bubblePrice;
        this._text = text;
        this._color = color;
        this._backgroundColor = backgroundColor;
        this._textColor = textColor;
        this._fontSize = fontSize;
        this._lineWidth = lineWidth;
        this._originalText = text;
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onDoubleClick = this._onDoubleClick.bind(this);
        this._onContextMenu = this._onContextMenu.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onInput = this._onInput.bind(this);
        this._onBlur = this._onBlur.bind(this);
        this._onDocumentClick = this._onDocumentClick.bind(this);
    }

    getMarkType(): MarkType {
        return this.markType;
    }

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this._addEventListeners();
        this.requestUpdate();
    }

    private _addEventListeners() {
        if (!this._chart) return;
        const chartElement = this._chart.chartElement();
        if (chartElement) {
            chartElement.addEventListener('mousedown', this._onMouseDown, true);
            chartElement.addEventListener('dblclick', this._onDoubleClick, true);
            chartElement.addEventListener('contextmenu', this._onContextMenu, true);
            chartElement.addEventListener('mousemove', this._onMouseMove, true);
            document.addEventListener('mousemove', this._onMouseMove);
            document.addEventListener('mouseup', this._onMouseUp);
            document.addEventListener('keydown', this._onKeyDown);
            document.addEventListener('click', this._onDocumentClick);
        }
    }

    private _removeEventListeners() {
        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('mouseup', this._onMouseUp);
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('click', this._onDocumentClick);
        if (!this._chart) return;
        const chartElement = this._chart.chartElement();
        if (chartElement) {
            chartElement.removeEventListener('mousedown', this._onMouseDown, true);
            chartElement.removeEventListener('dblclick', this._onDoubleClick, true);
            chartElement.removeEventListener('contextmenu', this._onContextMenu, true);
            chartElement.removeEventListener('mousemove', this._onMouseMove, true);
        }
    }

    updateAllViews() { }

    updateControlPointPosition(time: string, price: number) {
        this._controlPointTime = time;
        this._controlPointPrice = price;
        this.requestUpdate();
    }

    updateBubblePosition(time: string, price: number) {
        this._bubbleTime = time;
        this._bubblePrice = price;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this.requestUpdate();
    }

    setDraggingControlPoint(isDragging: boolean) {
        this._isDraggingControlPoint = isDragging;
        this.requestUpdate();
    }

    setDraggingBubble(isDragging: boolean) {
        this._isDraggingBubble = isDragging;
        this.requestUpdate();
    }

    setShowLabel(show: boolean) {
        this.requestUpdate();
    }

    dragControlPointByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;

        const timeScale = this._chart.timeScale();
        const currentX = timeScale.timeToCoordinate(this._controlPointTime);
        const currentY = this._series.priceToCoordinate(this._controlPointPrice);
        if (currentX === null || currentY === null) return;

        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        const newTime = timeScale.coordinateToTime(newX);
        const newPrice = this._series.coordinateToPrice(newY);

        if (newTime !== null && !isNaN(newPrice)) {
            this._controlPointTime = newTime.toString();
            this._controlPointPrice = newPrice;
            this.requestUpdate();
        }
    }

    dragBubbleByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;

        const timeScale = this._chart.timeScale();
        const currentX = timeScale.timeToCoordinate(this._bubbleTime);
        const currentY = this._series.priceToCoordinate(this._bubblePrice);
        if (currentX === null || currentY === null) return;

        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        const newTime = timeScale.coordinateToTime(newX);
        const newPrice = this._series.coordinateToPrice(newY);

        if (newTime !== null && !isNaN(newPrice)) {
            this._bubbleTime = newTime.toString();
            this._bubblePrice = newPrice;
            this.requestUpdate();
        }
    }

    isPointNearControlPoint(x: number, y: number, threshold: number = 8): boolean {
        if (!this._chart || !this._series) return false;
        const controlX = this._chart.timeScale().timeToCoordinate(this._controlPointTime);
        const controlY = this._series.priceToCoordinate(this._controlPointPrice);
        if (controlX === null || controlY === null) return false;
        const distance = Math.sqrt(Math.pow(x - controlX, 2) + Math.pow(y - controlY, 2));
        return distance <= threshold;
    }

    isPointNearBubble(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;
        const bubbleX = this._chart.timeScale().timeToCoordinate(this._bubbleTime);
        const bubbleY = this._series.priceToCoordinate(this._bubblePrice);
        if (bubbleX === null || bubbleY === null) return false;
        const padding = 12;
        const textWidth = this._text.length * this._fontSize * 0.6;
        const textHeight = this._fontSize;
        const bubbleRect = {
            x: bubbleX - textWidth / 2 - padding,
            y: bubbleY - textHeight / 2 - padding,
            width: textWidth + padding * 2,
            height: textHeight + padding * 2
        };
        return x >= bubbleRect.x &&
            x <= bubbleRect.x + bubbleRect.width &&
            y >= bubbleRect.y &&
            y <= bubbleRect.y + bubbleRect.height;
    }

    isPointNearConnectionLine(x: number, y: number, threshold: number = 4): boolean {
        if (!this._chart || !this._series) return false;
        const controlX = this._chart.timeScale().timeToCoordinate(this._controlPointTime);
        const controlY = this._series.priceToCoordinate(this._controlPointPrice);
        const bubbleX = this._chart.timeScale().timeToCoordinate(this._bubbleTime);
        const bubbleY = this._series.priceToCoordinate(this._bubblePrice);
        if (controlX === null || controlY === null || bubbleX === null || bubbleY === null) return false;
        return this.pointToLineDistance(x, y, controlX, controlY, bubbleX, bubbleY) <= threshold;
    }

    private _isPointInBubble(clientX: number, clientY: number): boolean {
        if (!this._chart || !this._series) return false;
        const chartElement = this._chart.chartElement();
        const rect = chartElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        return this.isPointNearBubble(x, y, 20);
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

    private _onMouseDown(event: MouseEvent) {
        if (event.button !== 0 || this._isEditing) return;
        const isClickInBubble = this._isPointInBubble(event.clientX, event.clientY);
        const isClickNearControlPoint = this._isPointNearControlPoint(event.clientX, event.clientY);
        if (isClickInBubble || isClickNearControlPoint) {
            if (isClickInBubble) {
                if (!this._isSelected) {
                    this._selectBubbleBoxMark(event);
                } else {
                    if (!this._isEditing) {
                        this._startEditing();
                    }
                }
                this._startDraggingBubble(event);
            } else if (isClickNearControlPoint) {
                this._startDraggingControlPoint(event);
            }
        } else if (this._isSelected) {
            this._deselectBubbleBoxMark();
        }
    }

    private _startDraggingBubble(event: MouseEvent) {
        this._isDraggingBubble = true;
        this._dispatchBubbleBoxMarkDragStart('bubble', event);
    }

    private _startDraggingControlPoint(event: MouseEvent) {
        this._isDraggingControlPoint = true;
        this._dispatchBubbleBoxMarkDragStart('controlPoint', event);
    }

    private _dispatchBubbleBoxMarkDragStart(dragType: 'controlPoint' | 'bubble' | 'connection', event?: MouseEvent) {
        if (!this._chart) return;
        const customEvent = new CustomEvent('bubbleBoxMarkDragStart', {
            detail: {
                mark: this,
                dragType: dragType,
                clientX: event?.clientX,
                clientY: event?.clientY
            },
            bubbles: true,
            composed: true
        });
        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _onMouseMove(event: MouseEvent) {
        if (!this._isDraggingBubble && !this._isDraggingControlPoint) {
            const isInBubble = this._isPointInBubble(event.clientX, event.clientY);
            const isNearControlPoint = this._isPointNearControlPoint(event.clientX, event.clientY);
            const newHovered = isInBubble || isNearControlPoint;
            if (newHovered !== this._lastHoverState) {
                this._isHovered = newHovered;
                this._lastHoverState = newHovered;
                this.requestUpdate();
            }
            if (this._isHovered && !this._isSelected) {
                this._chart.chartElement().style.cursor = 'move';
            } else if (this._isSelected) {
                this._chart.chartElement().style.cursor = 'move';
            } else {
                this._chart.chartElement().style.cursor = '';
            }
        }
    }

    private _onMouseUp(event: MouseEvent) {
        if (this._isDraggingBubble) {
            this._isDraggingBubble = false;
        }
        if (this._isDraggingControlPoint) {
            this._isDraggingControlPoint = false;
        }
        this._updateHoverState(event.clientX, event.clientY);
    }

    private _isPointNearControlPoint(clientX: number, clientY: number): boolean {
        if (!this._chart || !this._series) return false;
        const chartElement = this._chart.chartElement();
        const rect = chartElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        return this.isPointNearControlPoint(x, y, 8);
    }

    private _updateHoverState(clientX: number, clientY: number) {
        const isInBubble = this._isPointInBubble(clientX, clientY);
        const newHovered = isInBubble;
        if (newHovered !== this._isHovered) {
            this._isHovered = newHovered;
            this.requestUpdate();
        }
    }

    private _onDoubleClick(event: MouseEvent) {
        if (this._isPointInBubble(event.clientX, event.clientY)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            if (!this._isSelected) {
                this._selectBubbleBoxMark(event);
            }
            this._showEditorModal(event);
        }
    }

    private _showEditorModal(event?: MouseEvent) {
        if (!this._chart) return;
        this._deselectBubbleBoxMark();
        let modalPosition = { x: 0, y: 0 };
        if (event) {
            modalPosition = {
                x: event.clientX + 10,
                y: event.clientY + 10
            };
        } else {
            const screenCoords = this._getScreenCoordinates();
            const chartElement = this._chart.chartElement();
            const chartRect = chartElement.getBoundingClientRect();
            modalPosition = {
                x: chartRect.left + screenCoords.x + 10,
                y: chartRect.top + screenCoords.y + 10
            };
        }
        const customEvent = new CustomEvent('bubbleBoxMarkEditorRequest', {
            detail: {
                mark: this,
                position: modalPosition,
                clientX: event?.clientX,
                clientY: event?.clientY,
                text: this._text,
                color: this._color,
                backgroundColor: this._backgroundColor,
                textColor: this._textColor,
                fontSize: this._fontSize
            },
            bubbles: true
        });
        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _onContextMenu(event: MouseEvent) {
        if (this._isPointInBubble(event.clientX, event.clientY)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private _onDocumentClick(event: MouseEvent) {
        const isClickOutside = !this._isPointInBubble(event.clientX, event.clientY);
        if (isClickOutside && this._isSelected) {
            this._deselectBubbleBoxMark();
        }
    }

    private _onKeyDown(event: KeyboardEvent) {
        if (!this._isEditing) return;
        if (event.key === 'Backspace' && event.target === document.body) {
            event.preventDefault();
        }
        if (event.key === 'Escape') {
            this._cancelEditing();
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private _onInput(event: Event) {
        if (this._editInput) {
            this._text = this._editInput.value;
            this.requestUpdate();
        }
    }

    private _onBlur() {
        if (this._isEditing) {
            this._finishEditing();
        }
    }

    private _startEditing() {
        if (this._isEditing) return;
        this._isEditing = true;
        this._originalText = this._text;
        this._editInput = document.createElement('textarea');
        this._editInput.value = this._text;
        this._editInput.style.position = 'fixed';
        this._editInput.style.opacity = '0';
        this._editInput.style.pointerEvents = 'none';
        this._editInput.style.left = '-1000px';
        this._editInput.style.top = '-1000px';
        this._editInput.style.width = '300px';
        this._editInput.style.height = '150px';
        this._editInput.style.resize = 'none';
        this._editInput.addEventListener('input', this._onInput);
        this._editInput.addEventListener('blur', this._onBlur);
        this._editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this._cancelEditing();
                e.preventDefault();
                e.stopPropagation();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this._finishEditing();
                e.preventDefault();
                e.stopPropagation();
            }
        });
        document.body.appendChild(this._editInput);
        setTimeout(() => {
            if (this._editInput) {
                this._editInput.focus();
                this._editInput.setSelectionRange(this._editInput.value.length, this._editInput.value.length);
            }
        }, 0);
        this._startCursorBlink();
        this.requestUpdate();
    }

    private _startCursorBlink() {
        if (this._cursorTimer) {
            clearInterval(this._cursorTimer);
        }
        this._cursorTimer = window.setInterval(() => {
            this._cursorVisible = !this._cursorVisible;
            this.requestUpdate();
        }, 500);
    }

    private _stopCursorBlink() {
        if (this._cursorTimer) {
            clearInterval(this._cursorTimer);
            this._cursorTimer = null;
        }
        this._cursorVisible = true;
    }

    private _finishEditing() {
        if (!this._editInput) return;

        const newText = this._editInput.value;
        this._text = newText || this._originalText;

        this._cleanupEditing();
        this._updateHoverStateAfterEdit();
        this.requestUpdate();
    }

    private _cancelEditing() {
        this._text = this._originalText;
        this._cleanupEditing();
        this._updateHoverStateAfterEdit();
        this.requestUpdate();
    }

    private _cleanupEditing() {
        this._isEditing = false;
        this._stopCursorBlink();
        if (this._editInput) {
            this._editInput.removeEventListener('input', this._onInput);
            this._editInput.removeEventListener('blur', this._onBlur);
            if (this._editInput.parentNode) {
                this._editInput.parentNode.removeChild(this._editInput);
            }
            this._editInput = null;
        }
    }

    private _updateHoverStateAfterEdit() {
        this._isHovered = false;
        this._lastHoverState = false;
    }

    private _selectBubbleBoxMark(event?: MouseEvent) {
        this._isSelected = true;
        this._dispatchBubbleBoxMarkSelected(event);
        this.requestUpdate();
    }

    private _deselectBubbleBoxMark() {
        this._isSelected = false;
        this._dispatchBubbleBoxMarkDeselected();
        this.requestUpdate();
    }

    private _dispatchBubbleBoxMarkSelected(event?: MouseEvent) {
        if (!this._chart) return;
        const customEvent = new CustomEvent('bubbleBoxMarkSelected', {
            detail: {
                mark: this,
                position: this._getScreenCoordinates(),
                clientX: event?.clientX,
                clientY: event?.clientY,
                text: this._text,
                color: this._color,
                backgroundColor: this._backgroundColor,
                textColor: this._textColor,
                fontSize: this._fontSize
            },
            bubbles: true
        });
        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _dispatchBubbleBoxMarkDeselected() {
        if (!this._chart) return;
        const customEvent = new CustomEvent('bubbleBoxMarkDeselected', {
            detail: {
                mark: this
            },
            bubbles: true
        });
        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _dispatchBubbleBoxMarkDeleted() {
        if (!this._chart) return;
        const customEvent = new CustomEvent('bubbleBoxMarkDeleted', {
            detail: {
                mark: this
            },
            bubbles: true
        });
        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _getScreenCoordinates() {
        const bubbleX = this._chart.timeScale().timeToCoordinate(this._bubbleTime);
        const bubbleY = this._series.priceToCoordinate(this._bubblePrice);
        return { x: bubbleX, y: bubbleY };
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

    controlPointTime(): string {
        return this._controlPointTime;
    }

    controlPointPrice(): number {
        return this._controlPointPrice;
    }

    bubbleTime(): string {
        return this._bubbleTime;
    }

    bubblePrice(): number {
        return this._bubblePrice;
    }

    getText(): string {
        return this._text;
    }

    updateText(text: string) {
        this._text = text;
        this.requestUpdate();
    }

    public updateStyles(styles: { [key: string]: any }): void {
        if (styles['color']) this._color = styles['color'];
        if (styles['backgroundColor']) this._backgroundColor = styles['backgroundColor']
        if (styles['textColor']) this._textColor = styles['textColor']
        if (styles['fontSize']) this._fontSize = styles['fontSize']
        if (styles['lineWidth']) this._lineWidth = styles['lineWidth']
        this.requestUpdate();
    }

    public getCurrentStyles(): Record<string, any> {
        return {
            color: this._color,
            backgroundColor: this._backgroundColor,
            textColor: this._textColor,
            fontSize: this._fontSize,
            lineWidth: this._lineWidth,
            text: this._text
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const controlX = this._chart.timeScale().timeToCoordinate(this._controlPointTime);
        const controlY = this._series.priceToCoordinate(this._controlPointPrice);
        const bubbleX = this._chart.timeScale().timeToCoordinate(this._bubbleTime);
        const bubbleY = this._series.priceToCoordinate(this._bubblePrice);
        if (controlX === null || controlY === null || bubbleX === null || bubbleY === null) return null;
        const padding = 12;
        const textWidth = this._text.length * this._fontSize * 0.6;
        const textHeight = this._fontSize;
        const bubbleRect = {
            x: bubbleX - textWidth / 2 - padding,
            y: bubbleY - textHeight / 2 - padding,
            width: textWidth + padding * 2,
            height: textHeight + padding * 2
        };
        return {
            controlX,
            controlY,
            bubbleX,
            bubbleY,
            minX: Math.min(controlX, bubbleRect.x),
            maxX: Math.max(controlX, bubbleRect.x + bubbleRect.width),
            minY: Math.min(controlY, bubbleRect.y),
            maxY: Math.max(controlY, bubbleRect.y + bubbleRect.height)
        };
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const controlX = this._chart.timeScale().timeToCoordinate(this._controlPointTime);
                    const controlY = this._series.priceToCoordinate(this._controlPointPrice);
                    const bubbleX = this._chart.timeScale().timeToCoordinate(this._bubbleTime);
                    const bubbleY = this._series.priceToCoordinate(this._bubblePrice);
                    if (controlX === null || controlY === null || bubbleX === null || bubbleY === null) return;
                    ctx.save();
                    ctx.globalAlpha = 1.0;
                    ctx.strokeStyle = this._color;
                    ctx.fillStyle = this._backgroundColor;
                    ctx.lineWidth = this._lineWidth;
                    ctx.setLineDash([]);
                    const angle = Math.atan2(bubbleY - controlY, bubbleX - controlX);
                    const triangleBaseWidth = 20;
                    const tipX = controlX;
                    const tipY = controlY;
                    const perpendicularAngle = angle + Math.PI / 2;
                    const base1X = bubbleX + Math.cos(perpendicularAngle) * triangleBaseWidth / 2;
                    const base1Y = bubbleY + Math.sin(perpendicularAngle) * triangleBaseWidth / 2;
                    const base2X = bubbleX - Math.cos(perpendicularAngle) * triangleBaseWidth / 2;
                    const base2Y = bubbleY - Math.sin(perpendicularAngle) * triangleBaseWidth / 2;
                    ctx.beginPath();
                    ctx.moveTo(tipX, tipY);
                    ctx.lineTo(base1X, base1Y);
                    ctx.lineTo(base2X, base2Y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(tipX, tipY);
                    ctx.lineTo(base1X, base1Y);
                    ctx.lineTo(base2X, base2Y);
                    ctx.closePath();
                    ctx.stroke();
                    this.drawControlPoint(ctx, controlX, controlY);
                    const padding = 12;
                    const textWidth = this._text.length * this._fontSize * 0.6;
                    const textHeight = this._fontSize;
                    const bubbleRect = {
                        x: bubbleX - textWidth / 2 - padding,
                        y: bubbleY - textHeight / 2 - padding,
                        width: textWidth + padding * 2,
                        height: textHeight + padding * 2
                    };
                    ctx.fillStyle = this._backgroundColor;
                    ctx.beginPath();
                    ctx.roundRect(bubbleRect.x, bubbleRect.y, bubbleRect.width, bubbleRect.height, 6);
                    ctx.fill();
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.beginPath();
                    ctx.roundRect(bubbleRect.x, bubbleRect.y, bubbleRect.width, bubbleRect.height, 6);
                    ctx.stroke();
                    ctx.fillStyle = this._textColor;
                    ctx.font = `${this._fontSize}px Arial, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(this._text, bubbleX, bubbleY);
                    if (this._isDraggingBubble) {
                        ctx.strokeStyle = this._color;
                        ctx.lineWidth = 1;
                        ctx.setLineDash([5, 5]);
                        ctx.beginPath();
                        ctx.roundRect(
                            bubbleRect.x - 2,
                            bubbleRect.y - 2,
                            bubbleRect.width + 4,
                            bubbleRect.height + 4,
                            8
                        );
                        ctx.stroke();
                    }
                    if (this._isSelected || this._isHovered) {
                        ctx.strokeStyle = this._isSelected ? '#007bff' : 'rgba(0, 123, 255, 0.5)';
                        ctx.lineWidth = this._isSelected ? 2 : 1;
                        ctx.setLineDash(this._isSelected ? [] : [2, 2]);
                        const radius = 4;
                        ctx.beginPath();
                        ctx.moveTo(bubbleRect.x + radius, bubbleRect.y);
                        ctx.lineTo(bubbleRect.x + bubbleRect.width - radius, bubbleRect.y);
                        ctx.arcTo(bubbleRect.x + bubbleRect.width, bubbleRect.y, bubbleRect.x + bubbleRect.width, bubbleRect.y + radius, radius);
                        ctx.lineTo(bubbleRect.x + bubbleRect.width, bubbleRect.y + bubbleRect.height - radius);
                        ctx.arcTo(bubbleRect.x + bubbleRect.width, bubbleRect.y + bubbleRect.height, bubbleRect.x + bubbleRect.width - radius, bubbleRect.y + bubbleRect.height, radius);
                        ctx.lineTo(bubbleRect.x + radius, bubbleRect.y + bubbleRect.height);
                        ctx.arcTo(bubbleRect.x, bubbleRect.y + bubbleRect.height, bubbleRect.x, bubbleRect.y + bubbleRect.height - radius, radius);
                        ctx.lineTo(bubbleRect.x, bubbleRect.y + radius);
                        ctx.arcTo(bubbleRect.x, bubbleRect.y, bubbleRect.x + radius, bubbleRect.y, radius);
                        ctx.closePath();
                        ctx.stroke();
                    }
                    if (this._isEditing) {
                        ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
                        ctx.strokeStyle = '#007bff';
                        ctx.lineWidth = 2;
                        ctx.setLineDash([5, 3]);
                        const radius = 4;
                        ctx.beginPath();
                        ctx.moveTo(bubbleRect.x + radius, bubbleRect.y);
                        ctx.lineTo(bubbleRect.x + bubbleRect.width - radius, bubbleRect.y);
                        ctx.arcTo(bubbleRect.x + bubbleRect.width, bubbleRect.y, bubbleRect.x + bubbleRect.width, bubbleRect.y + radius, radius);
                        ctx.lineTo(bubbleRect.x + bubbleRect.width, bubbleRect.y + bubbleRect.height - radius);
                        ctx.arcTo(bubbleRect.x + bubbleRect.width, bubbleRect.y + bubbleRect.height, bubbleRect.x + bubbleRect.width - radius, bubbleRect.y + bubbleRect.height, radius);
                        ctx.lineTo(bubbleRect.x + radius, bubbleRect.y + bubbleRect.height);
                        ctx.arcTo(bubbleRect.x, bubbleRect.y + bubbleRect.height, bubbleRect.x, bubbleRect.y + bubbleRect.height - radius, radius);
                        ctx.lineTo(bubbleRect.x, bubbleRect.y + radius);
                        ctx.arcTo(bubbleRect.x, bubbleRect.y, bubbleRect.x + radius, bubbleRect.y, radius);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                    }
                    if (this._isEditing && this._cursorVisible) {
                        ctx.strokeStyle = '#333';
                        ctx.lineWidth = 1;
                        ctx.setLineDash([]);
                        ctx.beginPath();
                        const textX = bubbleX;
                        const textY = bubbleY;
                        const metrics = ctx.measureText(this._text);
                        ctx.moveTo(textX + metrics.width / 2, textY - this._fontSize / 2);
                        ctx.lineTo(textX + metrics.width / 2, textY + this._fontSize / 2);
                        ctx.stroke();
                    }
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private drawControlPoint(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.save();
        ctx.fillStyle = '#3964FE';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        if (this._isDraggingControlPoint) {
            ctx.strokeStyle = '#3964FE';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }

    getControlPointTime(): string {
        return this._controlPointTime;
    }

    getControlPointPrice(): number {
        return this._controlPointPrice;
    }

    getBubbleTime(): string {
        return this._bubbleTime;
    }

    getBubblePrice(): number {
        return this._bubblePrice;
    }

    public updateTextContent(text: string, color?: string, backgroundColor?: string, textColor?: string, fontSize?: number) {
        this._text = text;
        if (color !== undefined) this._color = color;
        if (backgroundColor !== undefined) this._backgroundColor = backgroundColor;
        if (textColor !== undefined) this._textColor = textColor;
        if (fontSize !== undefined) this._fontSize = fontSize;
        this.requestUpdate();
    }

    public delete() {
        this._deselectBubbleBoxMark();
        this._dispatchBubbleBoxMarkDeleted();
    }

    public getPosition() {
        return {
            controlPointTime: this._controlPointTime,
            controlPointPrice: this._controlPointPrice,
            bubbleTime: this._bubbleTime,
            bubblePrice: this._bubblePrice,
            text: this._text,
            fontSize: this._fontSize,
            color: this._color,
            backgroundColor: this._backgroundColor,
            textColor: this._textColor
        };
    }

    destroy() {
        this._cleanupEditing();
        this._deselectBubbleBoxMark();
        this._removeEventListeners();
        if (this._chart) {
            this._chart.chartElement().style.cursor = '';
        }
    }
}