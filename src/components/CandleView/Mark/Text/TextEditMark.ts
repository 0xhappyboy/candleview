import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class TextEditMark implements IGraph, IGraphStyle {
    private _chart: any;
    private _series: any;
    private _bubbleTime: string;
    private _bubblePrice: number;
    private _renderer: any;
    private _color: string;
    private _backgroundColor: string;
    private _textColor: string;
    private _fontSize: number;
    private _lineWidth: number;
    private _text: string;
    private _isDraggingBubble: boolean = false;
    private markType: MarkType = MarkType.TextEdit;
    private _isEditing = false;
    private _editInput: HTMLTextAreaElement | null = null;
    private _isSelected = false;
    private _isHovered = false;
    private _lastHoverState = false;
    private _clickCount = 0;
    private _clickTimer: number | null = null;
    private _originalText: string = '';
    private _cursorVisible = true;
    private _cursorTimer: number | null = null;
    private _firstClickTime: number = 0;
    private _doubleClickThreshold: number = 300;
    private _slowClickThreshold: number = 500;

    constructor(
        bubbleTime: string,
        bubblePrice: number,
        text: string = '',
        color: string = '#2962FF',
        backgroundColor: string = 'rgba(41, 98, 255)',
        textColor: string = '#FFFFFF',
        fontSize: number = 12,
        lineWidth: number = 1,
    ) {
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

    updateLineStyle(lineStyle: "solid" | "dashed" | "dotted"): void {
        throw new Error("Method not implemented.");
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

    updateBubblePosition(time: string, price: number) {
        this._bubbleTime = time;
        this._bubblePrice = price;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this.requestUpdate();
    }

    setDraggingBubble(isDragging: boolean) {
        this._isDraggingBubble = isDragging;
        this.requestUpdate();
    }

    setShowLabel(show: boolean) {
        this.requestUpdate();
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

    private _isPointInBubble(clientX: number, clientY: number): boolean {
        if (!this._chart || !this._series) return false;
        const chartElement = this._chart.chartElement();
        const rect = chartElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        return this.isPointNearBubble(x, y, 20);
    }

    private _onMouseDown(event: MouseEvent) {
        if (event.button !== 0 || this._isEditing) return;
        const isClickInBubble = this._isPointInBubble(event.clientX, event.clientY);
        if (isClickInBubble) {
            if (!this._isSelected) {
                this._selectTextEditMark(event);
            } else {
                if (!this._isEditing) {
                    this._startEditing();
                }
            }
            this._startDraggingBubble(event);
        } else if (this._isSelected) {
            this._deselectTextEditMark();
        }
    }

    private _startDraggingBubble(event: MouseEvent) {
        this._isDraggingBubble = true;
        this._dispatchTextEditMarkDragStart('bubble', event);
    }

    private _dispatchTextEditMarkDragStart(dragType: 'bubble', event?: MouseEvent) {
        if (!this._chart) return;
        const customEvent = new CustomEvent('textEditMarkDragStart', {
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
        if (!this._isDraggingBubble) {
            const isInBubble = this._isPointInBubble(event.clientX, event.clientY);
            const newHovered = isInBubble;
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
        this._updateHoverState(event.clientX, event.clientY);
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
                this._selectTextEditMark(event);
            }
            this._showEditorModal(event);
        }
    }

    private _showEditorModal(event?: MouseEvent) {
        if (!this._chart) return;
        this._deselectTextEditMark();
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
        const customEvent = new CustomEvent('textEditMarkEditorRequest', {
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
            this._deselectTextEditMark();
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

    private _selectTextEditMark(event?: MouseEvent) {
        this._isSelected = true;
        this._dispatchTextEditMarkSelected(event);
        this.requestUpdate();
    }

    private _deselectTextEditMark() {
        this._isSelected = false;
        this._dispatchTextEditMarkDeselected();
        this.requestUpdate();
    }

    private _dispatchTextEditMarkSelected(event?: MouseEvent) {
        if (!this._chart) return;
        const customEvent = new CustomEvent('textEditMarkSelected', {
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

    private _dispatchTextEditMarkDeselected() {
        if (!this._chart) return;
        const customEvent = new CustomEvent('textEditMarkDeselected', {
            detail: {
                mark: this
            },
            bubbles: true
        });
        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _dispatchTextEditMarkDeleted() {
        if (!this._chart) return;
        const customEvent = new CustomEvent('textEditMarkDeleted', {
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
                console.error(error);
            }
            if (this._series._internal__dataChanged) {
                this._series._internal__dataChanged();
            }
            if (this._chart._internal__paneUpdate) {
                this._chart._internal__paneUpdate();
            }
        }
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

    updateColor(color: string) {
        this._color = color;
        this.requestUpdate();
    }

    updateBackgroundColor(backgroundColor: string) {
        this._backgroundColor = backgroundColor;
        this.requestUpdate();
    }

    updateTextColor(textColor: string) {
        this._textColor = textColor;
        this.requestUpdate();
    }

    updateFontSize(fontSize: number) {
        this._fontSize = fontSize;
        this.requestUpdate();
    }

    updateLineWidth(lineWidth: number) {
        this._lineWidth = lineWidth;
        this.requestUpdate();
    }

    public updateStyles(styles: {
        color?: string;
        backgroundColor?: string;
        textColor?: string;
        fontSize?: number;
        lineWidth?: number;
        [key: string]: any;
    }): void {
        if (styles.color) this.updateColor(styles.color);
        if (styles.backgroundColor) this.updateBackgroundColor(styles.backgroundColor);
        if (styles.textColor) this.updateTextColor(styles.textColor);
        if (styles.fontSize) this.updateFontSize(styles.fontSize);
        if (styles.lineWidth) this.updateLineWidth(styles.lineWidth);
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
        const bubbleX = this._chart.timeScale().timeToCoordinate(this._bubbleTime);
        const bubbleY = this._series.priceToCoordinate(this._bubblePrice);
        if (bubbleX === null || bubbleY === null) return null;
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
            bubbleX,
            bubbleY,
            minX: bubbleRect.x,
            maxX: bubbleRect.x + bubbleRect.width,
            minY: bubbleRect.y,
            maxY: bubbleRect.y + bubbleRect.height
        };
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const bubbleX = this._chart.timeScale().timeToCoordinate(this._bubbleTime);
                    const bubbleY = this._series.priceToCoordinate(this._bubblePrice);
                    if (bubbleX === null || bubbleY === null) return;
                    ctx.save();
                    ctx.globalAlpha = 1.0;
                    ctx.strokeStyle = this._color;
                    ctx.fillStyle = this._backgroundColor;
                    ctx.lineWidth = this._lineWidth;
                    ctx.setLineDash([]);
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
        this._deselectTextEditMark();
        this._dispatchTextEditMarkDeleted();
    }

    public getPosition() {
        return {
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
        this._deselectTextEditMark();
        this._removeEventListeners();
        if (this._chart) {
            this._chart.chartElement().style.cursor = '';
        }
    }
}