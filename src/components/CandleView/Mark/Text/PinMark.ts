import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export class PinMark implements IGraph, IMarkStyle {
    private _chart: any;
    private _series: any;
    private _time: string;
    private _price: number;
    private _renderer: any;
    private _color: string;
    private _backgroundColor: string;
    private _textColor: string;
    private _fontSize: number;
    private _lineWidth: number;
    private _showBubble: boolean = false;
    private _bubbleText: string = "";
    private markType: MarkType = MarkType.Pin;
    private _isEditing = false;
    private _editInput: HTMLTextAreaElement | null = null;
    private _isSelected = false;
    private _isHovered = false;
    private _lastHoverState = false;
    private _cursorVisible = true;
    private _cursorTimer: number | null = null;
    private _originalText: string = '';
    private _isDragging: boolean = false;

    constructor(
        time: string,
        price: number,
        color: string = '#3964FE',
        backgroundColor: string = 'rgba(57, 100, 254, 0.9)',
        textColor: string = '#FFFFFF',
        fontSize: number = 12,
        lineWidth: number = 2,
        bubbleText: string = ""
    ) {
        this._time = time;
        this._price = price;
        this._color = color;
        this._backgroundColor = backgroundColor;
        this._textColor = textColor;
        this._fontSize = fontSize;
        this._lineWidth = lineWidth;
        this._bubbleText = bubbleText;
        this._originalText = bubbleText;
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onInput = this._onInput.bind(this);
        this._onBlur = this._onBlur.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onDoubleClick = this._onDoubleClick.bind(this);
        this._onContextMenu = this._onContextMenu.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
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

    updatePosition(time: string, price: number) {
        this._time = time;
        this._price = price;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this.requestUpdate();
    }

    setDragging(isDragging: boolean) {
        this._isDragging = isDragging;
        this.requestUpdate();
    }

    setShowBubble(show: boolean) {
        this._showBubble = show;
        this.requestUpdate();
    }

    setBubbleText(text: string) {
        this._bubbleText = text;
        this.requestUpdate();
    }

    dragByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const currentX = timeScale.timeToCoordinate(this._time);
        const currentY = this._series.priceToCoordinate(this._price);
        if (currentX === null || currentY === null) return;
        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        const newTime = timeScale.coordinateToTime(newX);
        const newPrice = this._series.coordinateToPrice(newY);
        if (newTime !== null && !isNaN(newPrice)) {
            this._time = newTime.toString();
            this._price = newPrice;
            this.requestUpdate();
        }
    }

    isPointNearPin(x: number, y: number, threshold: number = 20): boolean {
        if (!this._chart || !this._series) return false;
        const pinX = this._chart.timeScale().timeToCoordinate(this._time);
        const pinY = this._series.priceToCoordinate(this._price);
        if (pinX === null || pinY === null) return false;
        const pinWidth = 24;
        const pinHeight = 32;
        const pinRect = {
            x: pinX - pinWidth / 2,
            y: pinY - pinHeight,
            width: pinWidth,
            height: pinHeight
        };
        const inPin = x >= pinRect.x &&
            x <= pinRect.x + pinRect.width &&
            y >= pinRect.y &&
            y <= pinRect.y + pinRect.height;
        if (inPin) return true;
        if (this._showBubble) {
            const bubbleWidth = this._bubbleText.length * this._fontSize * 0.6 + 16;
            const bubbleHeight = this._fontSize + 12;
            const bubbleY = pinY - pinHeight - bubbleHeight - 10;
            const bubbleRect = {
                x: pinX - bubbleWidth / 2,
                y: bubbleY,
                width: bubbleWidth,
                height: bubbleHeight
            };
            const inBubble = x >= bubbleRect.x &&
                x <= bubbleRect.x + bubbleRect.width &&
                y >= bubbleRect.y &&
                y <= bubbleRect.y + bubbleRect.height;

            if (inBubble) return true;
        }
        return false;
    }

    private _isPointInBubble(clientX: number, clientY: number): boolean {
        if (!this._chart || !this._series) return false;
        const chartElement = this._chart.chartElement();
        const rect = chartElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const pinX = this._chart.timeScale().timeToCoordinate(this._time);
        const pinY = this._series.priceToCoordinate(this._price);
        if (pinX === null || pinY === null) return false;

        if (this._showBubble) {
            const bubbleWidth = this._bubbleText.length * this._fontSize * 0.6 + 16;
            const bubbleHeight = this._fontSize + 12;
            const bubbleY = pinY - 32 - bubbleHeight - 10;
            const bubbleRect = {
                x: pinX - bubbleWidth / 2,
                y: bubbleY,
                width: bubbleWidth,
                height: bubbleHeight
            };
            return x >= bubbleRect.x &&
                x <= bubbleRect.x + bubbleWidth &&
                y >= bubbleRect.y &&
                y <= bubbleRect.y + bubbleHeight;
        }
        return false;
    }

    private _isPointInPin(clientX: number, clientY: number): boolean {
        if (!this._chart || !this._series) return false;
        const chartElement = this._chart.chartElement();
        const rect = chartElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const pinX = this._chart.timeScale().timeToCoordinate(this._time);
        const pinY = this._series.priceToCoordinate(this._price);
        if (pinX === null || pinY === null) return false;
        const pinWidth = 24;
        const pinHeight = 32;
        const pinRect = {
            x: pinX - pinWidth / 2,
            y: pinY - pinHeight,
            width: pinWidth,
            height: pinHeight
        };
        return x >= pinRect.x &&
            x <= pinRect.x + pinWidth &&
            y >= pinRect.y &&
            y <= pinRect.y + pinHeight;
    }

    private _onMouseDown(event: MouseEvent) {
        if (event.button !== 0 || this._isEditing) return;
        const isClickInPin = this._isPointInPin(event.clientX, event.clientY);
        const isClickInBubble = this._isPointInBubble(event.clientX, event.clientY);
        if (isClickInPin || isClickInBubble) {
            if (isClickInBubble && this._showBubble) {
                if (!this._isSelected) {
                    this._selectPinMark(event);
                } else {
                    if (!this._isEditing) {
                        this._startEditing();
                    }
                }
            }
            this._isDragging = true;
            this._dispatchPinMarkDragStart(event);
        } else if (this._isSelected) {
            this._deselectPinMark();
        }
    }

    private _onMouseMove(event: MouseEvent) {
        if (!this._isDragging) {
            const isInPin = this._isPointInPin(event.clientX, event.clientY);
            const isInBubble = this._isPointInBubble(event.clientX, event.clientY);
            const newHovered = isInPin || isInBubble;
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
        if (this._isDragging) {
            this._isDragging = false;
        }
        this._updateHoverState(event.clientX, event.clientY);
    }

    private _updateHoverState(clientX: number, clientY: number) {
        const isInPin = this._isPointInPin(clientX, clientY);
        const isInBubble = this._isPointInBubble(clientX, clientY);
        const newHovered = isInPin || isInBubble;
        if (newHovered !== this._isHovered) {
            this._isHovered = newHovered;
            this.requestUpdate();
        }
    }

    private _onDoubleClick(event: MouseEvent) {
        const isInBubble = this._isPointInBubble(event.clientX, event.clientY);
        if (isInBubble && this._showBubble) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            if (!this._isSelected) {
                this._selectPinMark(event);
            }
            this._showEditorModal(event);
        }
    }

    private _showEditorModal(event?: MouseEvent) {
        if (!this._chart) return;
        this._deselectPinMark();
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
        const customEvent = new CustomEvent('pinMarkEditorRequest', {
            detail: {
                mark: this,
                position: modalPosition,
                clientX: event?.clientX,
                clientY: event?.clientY,
                bubbleText: this._bubbleText,
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
        const isInBubble = this._isPointInBubble(event.clientX, event.clientY);
        if (isInBubble) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private _onDocumentClick(event: MouseEvent) {
        const isClickOutside = !this._isPointInBubble(event.clientX, event.clientY) &&
            !this._isPointInPin(event.clientX, event.clientY);
        if (isClickOutside && this._isSelected) {
            this._deselectPinMark();
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
            this._bubbleText = this._editInput.value;
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
        this._originalText = this._bubbleText;
        this._editInput = document.createElement('textarea');
        this._editInput.value = this._bubbleText;
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
        this._bubbleText = newText || this._originalText;

        this._cleanupEditing();
        this._updateHoverStateAfterEdit();
        this.requestUpdate();
    }

    private _cancelEditing() {
        this._bubbleText = this._originalText;
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

    private _selectPinMark(event?: MouseEvent) {
        this._isSelected = true;
        this._dispatchPinMarkSelected(event);
        this.requestUpdate();
    }

    private _deselectPinMark() {
        this._isSelected = false;
        this._dispatchPinMarkDeselected();
        this.requestUpdate();
    }

    private _dispatchPinMarkDragStart(event?: MouseEvent) {
        if (!this._chart) return;
        const customEvent = new CustomEvent('pinMarkDragStart', {
            detail: {
                mark: this,
                clientX: event?.clientX,
                clientY: event?.clientY
            },
            bubbles: true,
            composed: true
        });
        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _dispatchPinMarkSelected(event?: MouseEvent) {
        if (!this._chart) return;
        const customEvent = new CustomEvent('pinMarkSelected', {
            detail: {
                mark: this,
                position: this._getScreenCoordinates(),
                clientX: event?.clientX,
                clientY: event?.clientY,
                bubbleText: this._bubbleText,
                color: this._color,
                backgroundColor: this._backgroundColor,
                textColor: this._textColor,
                fontSize: this._fontSize
            },
            bubbles: true
        });
        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _dispatchPinMarkDeselected() {
        if (!this._chart) return;
        const customEvent = new CustomEvent('pinMarkDeselected', {
            detail: {
                mark: this
            },
            bubbles: true
        });
        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _dispatchPinMarkDeleted() {
        if (!this._chart) return;
        const customEvent = new CustomEvent('pinMarkDeleted', {
            detail: {
                mark: this
            },
            bubbles: true
        });
        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _getScreenCoordinates() {
        const pinX = this._chart.timeScale().timeToCoordinate(this._time);
        const pinY = this._series.priceToCoordinate(this._price);
        return { x: pinX, y: pinY };
    }

    private drawInvertedDropIcon(ctx: CanvasRenderingContext2D, x: number, y: number, width: number = 28, height: number = 38) {
        ctx.save();
        ctx.fillStyle = this._color;
        ctx.strokeStyle = this._color;
        ctx.lineWidth = this._lineWidth;
        ctx.beginPath();
        const topRadius = width / 2;
        const topCenterY = y - height + topRadius * 0.8;
        ctx.moveTo(x, topCenterY - topRadius);
        ctx.bezierCurveTo(
            x - topRadius * 1.0, topCenterY - topRadius * 0.6,
            x - topRadius * 0.8, topCenterY + topRadius * 0.8,
            x - topRadius * 0.3, y - topRadius * 0.3
        );
        ctx.quadraticCurveTo(x, y, x + topRadius * 0.3, y - topRadius * 0.3);
        ctx.bezierCurveTo(
            x + topRadius * 0.8, topCenterY + topRadius * 0.8,
            x + topRadius * 1.0, topCenterY - topRadius * 0.6,
            x, topCenterY - topRadius
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, topCenterY - topRadius * 0.1, width / 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.restore();
    }

    private drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
        if (!text) return;
        const padding = 8;
        const pointerHeight = 6;
        const textWidth = text.length * this._fontSize * 0.6;
        const textHeight = this._fontSize;
        const bubbleWidth = textWidth + padding * 2;
        const bubbleHeight = textHeight + padding * 2;
        const pinHeight = 32;
        const bubbleY = y - pinHeight - bubbleHeight - 10;
        const bubbleX = x - bubbleWidth / 2;
        ctx.fillStyle = this._backgroundColor;
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 4);
        ctx.fill();
        ctx.strokeStyle = this._color;
        ctx.lineWidth = this._lineWidth;
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 4);
        ctx.stroke();
        ctx.fillStyle = this._backgroundColor;
        ctx.beginPath();
        ctx.moveTo(x - 6, bubbleY + bubbleHeight);
        ctx.lineTo(x, bubbleY + bubbleHeight + pointerHeight);
        ctx.lineTo(x + 6, bubbleY + bubbleHeight);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this._color;
        ctx.lineWidth = this._lineWidth;
        ctx.beginPath();
        ctx.moveTo(x - 6, bubbleY + bubbleHeight);
        ctx.lineTo(x, bubbleY + bubbleHeight + pointerHeight);
        ctx.lineTo(x + 6, bubbleY + bubbleHeight);
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = this._textColor;
        ctx.font = `${this._fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, bubbleY + bubbleHeight / 2);
        if (this._isSelected || this._isHovered) {
            ctx.strokeStyle = this._isSelected ? '#007bff' : 'rgba(0, 123, 255, 0.5)';
            ctx.lineWidth = this._isSelected ? 2 : 1;
            ctx.setLineDash(this._isSelected ? [] : [2, 2]);
            const radius = 4;
            ctx.beginPath();
            ctx.moveTo(bubbleX + radius, bubbleY);
            ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY);
            ctx.arcTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + radius, radius);
            ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius);
            ctx.arcTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - radius, bubbleY + bubbleHeight, radius);
            ctx.lineTo(bubbleX + radius, bubbleY + bubbleHeight);
            ctx.arcTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - radius, radius);
            ctx.lineTo(bubbleX, bubbleY + radius);
            ctx.arcTo(bubbleX, bubbleY, bubbleX + radius, bubbleY, radius);
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
            ctx.moveTo(bubbleX + radius, bubbleY);
            ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY);
            ctx.arcTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + radius, radius);
            ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius);
            ctx.arcTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - radius, bubbleY + bubbleHeight, radius);
            ctx.lineTo(bubbleX + radius, bubbleY + bubbleHeight);
            ctx.arcTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - radius, radius);
            ctx.lineTo(bubbleX, bubbleY + radius);
            ctx.arcTo(bubbleX, bubbleY, bubbleX + radius, bubbleY, radius);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        if (this._isEditing && this._cursorVisible) {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.setLineDash([]);
            ctx.beginPath();
            const textX = x;
            const textY = bubbleY + bubbleHeight / 2;
            const metrics = ctx.measureText(this._bubbleText);
            ctx.moveTo(textX + metrics.width / 2, textY - this._fontSize / 2);
            ctx.lineTo(textX + metrics.width / 2, textY + this._fontSize / 2);
            ctx.stroke();
        }
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

    time() {
        return this._time;
    }

    priceValue() {
        return this._price;
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const pinX = this._chart.timeScale().timeToCoordinate(this._time);
                    const pinY = this._series.priceToCoordinate(this._price);
                    if (pinX === null || pinY === null) return;
                    ctx.save();
                    ctx.globalAlpha = 1.0;
                    if (this._showBubble && this._bubbleText) {
                        this.drawBubble(ctx, pinX, pinY, this._bubbleText);
                    }
                    this.drawInvertedDropIcon(ctx, pinX, pinY, 24, 32);
                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    getTime(): string {
        return this._time;
    }

    getPrice(): number {
        return this._price;
    }

    updateBubbleText(text: string) {
        this._bubbleText = text;
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
            bubbleText: this._bubbleText,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const pinX = this._chart.timeScale().timeToCoordinate(this._time);
        const pinY = this._series.priceToCoordinate(this._price);
        if (pinX === null || pinY === null) return null;

        const pinWidth = 24;
        const pinHeight = 32;
        let minY = pinY - pinHeight;
        let maxY = pinY;

        if (this._showBubble && this._bubbleText) {
            const bubbleHeight = this._fontSize + 12;
            minY = Math.min(minY, pinY - pinHeight - bubbleHeight - 10);
        }

        return {
            x: pinX,
            y: pinY,
            minX: pinX - pinWidth / 2,
            maxX: pinX + pinWidth / 2,
            minY: minY,
            maxY: maxY
        };
    }

    public delete() {
        this._deselectPinMark();
        this._dispatchPinMarkDeleted();
    }

    public getPosition() {
        return {
            time: this._time,
            price: this._price,
            bubbleText: this._bubbleText,
            fontSize: this._fontSize,
            color: this._color,
            backgroundColor: this._backgroundColor,
            textColor: this._textColor
        };
    }

    destroy() {
        this._cleanupEditing();
        this._deselectPinMark();
        this._removeEventListeners();
        if (this._chart) {
            this._chart.chartElement().style.cursor = '';
        }
    }
}