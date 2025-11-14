import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IGraphStyle } from "../IGraphStyle";

export class TextEditMark implements IGraph, IGraphStyle {
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
    private _text: string;
    private _isDragging: boolean = false;
    private markType: MarkType = MarkType.TextEdit;
    private _isEditing = false;
    private _editInput: HTMLTextAreaElement | null = null;
    private _isSelected = false;
    private _isHovered = false;
    private _lastHoverState = false;
    private _originalText: string = '';
    private _cursorVisible = true;
    private _cursorTimer: number | null = null;
    private _width: number = 200;
    private _height: number = 100;

    constructor(
        time: string,
        price: number,
        text: string = '',
        color: string = '#2962FF',
        backgroundColor: string = 'rgba(255, 255, 255)',
        textColor: string = '#333333',
        fontSize: number = 14,
        lineWidth: number = 2,
        width: number = 200,
        height: number = 100
    ) {
        this._time = time;
        this._price = price;
        this._text = text;
        this._color = color;
        this._backgroundColor = backgroundColor;
        this._textColor = textColor;
        this._fontSize = fontSize;
        this._lineWidth = lineWidth;
        this._width = width;
        this._height = height;
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
        setTimeout(() => {
            this._startEditing();
        }, 100);
        this.requestUpdate();
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

    private _dispatchTextEditMarkEditorRequest(event?: MouseEvent) {
        if (!this._chart) return;
        const customEvent = new CustomEvent('textEditMarkEditorRequest', {
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

    setDragging(isDragging: boolean) {
        this._isDragging = isDragging;
        this.requestUpdate();
    }

    setShowLabel(show: boolean) {
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

    isPointInTextBox(x: number, y: number): boolean {
        if (!this._chart || !this._series) return false;
        const textX = this._chart.timeScale().timeToCoordinate(this._time);
        const textY = this._series.priceToCoordinate(this._price);
        if (textX === null || textY === null) return false;

        const textRect = {
            x: textX - this._width / 2,
            y: textY - this._height / 2,
            width: this._width,
            height: this._height
        };

        return x >= textRect.x &&
            x <= textRect.x + textRect.width &&
            y >= textRect.y &&
            y <= textRect.y + textRect.height;
    }

    private _isPointInText(clientX: number, clientY: number): boolean {
        if (!this._chart || !this._series) return false;
        const chartElement = this._chart.chartElement();
        const rect = chartElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        return this.isPointInTextBox(x, y);
    }

    private _onMouseDown(event: MouseEvent) {
        if (event.button !== 0 || this._isEditing) return;
        const isClickInText = this._isPointInText(event.clientX, event.clientY);
        if (isClickInText) {
            if (!this._isSelected) {
                this._selectTextEditMark(event);
            } else {
                if (!this._isEditing) {
                    this._startEditing();
                }
            }
            this._startDragging(event);
        } else if (this._isSelected) {
            this._deselectTextEditMark();
        }
    }

    private _startDragging(event: MouseEvent) {
        this._isDragging = true;
        this._dispatchTextEditMarkDragStart(event);
    }

    private _dispatchTextEditMarkDragStart(event?: MouseEvent) {
        if (!this._chart) return;
        const customEvent = new CustomEvent('textEditMarkDragStart', {
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

    private _onMouseMove(event: MouseEvent) {
        if (!this._isDragging) {
            const isInText = this._isPointInText(event.clientX, event.clientY);
            const newHovered = isInText;
            if (newHovered !== this._lastHoverState) {
                this._isHovered = newHovered;
                this._lastHoverState = newHovered;
                this.requestUpdate();
            }
            if (this._isHovered || this._isSelected) {
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
        const isInText = this._isPointInText(clientX, clientY);
        const newHovered = isInText;
        if (newHovered !== this._isHovered) {
            this._isHovered = newHovered;
            this.requestUpdate();
        }
    }

    private _onDoubleClick(event: MouseEvent) {
        if (this._isPointInText(event.clientX, event.clientY)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            if (!this._isSelected) {
                this._selectTextEditMark(event);
            }
            this._showEditorModal(event);
        }
    }

    private _onContextMenu(event: MouseEvent) {
        if (this._isPointInText(event.clientX, event.clientY)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private _onDocumentClick(event: MouseEvent) {
        const isClickOutside = !this._isPointInText(event.clientX, event.clientY);
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
            this._adjustSizeToContent();
            this.requestUpdate();
        }
    }

    private _onBlur() {
        if (this._isEditing) {
            this._finishEditing();
        }
    }

    private _adjustSizeToContent() {
        if (!this._editInput) return;
        const lines = this._text.split('\n');
        const lineCount = Math.max(1, lines.length);
        const maxLineLength = Math.max(...lines.map(line => line.length));
        this._height = Math.max(40, lineCount * this._fontSize * 1.5 + 20);
        this._width = Math.max(120, Math.min(400, maxLineLength * this._fontSize * 0.7 + 40));
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
        this._editInput.style.fontSize = `${this._fontSize}px`;
        this._editInput.style.fontFamily = 'Arial, sans-serif';
        this._editInput.style.lineHeight = '1.5';

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

        const newText = this._editInput.value.trim();
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
        const x = this._chart.timeScale().timeToCoordinate(this._time);
        const y = this._series.priceToCoordinate(this._price);
        return { x, y };
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

    getTime(): string {
        return this._time;
    }

    getPrice(): number {
        return this._price;
    }

    getText(): string {
        return this._text;
    }

    updateText(text: string) {
        this._text = text;
        this._adjustSizeToContent();
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

    updateSize(width: number, height: number) {
        this._width = width;
        this._height = height;
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
            text: this._text,
            width: this._width,
            height: this._height
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;
        const x = this._chart.timeScale().timeToCoordinate(this._time);
        const y = this._series.priceToCoordinate(this._price);
        if (x === null || y === null) return null;

        return {
            x: x - this._width / 2,
            y: y - this._height / 2,
            width: this._width,
            height: this._height,
            minX: x - this._width / 2,
            maxX: x + this._width / 2,
            minY: y - this._height / 2,
            maxY: y + this._height / 2
        };
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const x = this._chart.timeScale().timeToCoordinate(this._time);
                    const y = this._series.priceToCoordinate(this._price);
                    if (x === null || y === null) return;
                    ctx.save();
                    ctx.globalAlpha = 1.0;
                    const textRect = {
                        x: x - this._width / 2,
                        y: y - this._height / 2,
                        width: this._width,
                        height: this._height
                    };
                    ctx.fillStyle = this._backgroundColor;
                    ctx.beginPath();
                    ctx.roundRect(textRect.x, textRect.y, textRect.width, textRect.height, 8);
                    ctx.fill();
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.beginPath();
                    ctx.roundRect(textRect.x, textRect.y, textRect.width, textRect.height, 8);
                    ctx.stroke();
                    ctx.fillStyle = this._textColor;
                    ctx.font = `${this._fontSize}px Arial, sans-serif`;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'top';
                    const padding = 10;
                    const maxWidth = this._width - padding * 2;
                    const lineHeight = this._fontSize * 1.5;
                    const lines = this._wrapText(ctx, this._text, maxWidth);
                    lines.forEach((line, index) => {
                        ctx.fillText(
                            line,
                            textRect.x + padding,
                            textRect.y + padding + index * lineHeight
                        );
                    });
                    if (this._isSelected || this._isHovered) {
                        ctx.strokeStyle = this._isSelected ? '#007bff' : 'rgba(0, 123, 255)';
                        ctx.lineWidth = this._isSelected ? 2 : 1;
                        ctx.setLineDash(this._isSelected ? [] : [2, 2]);
                        ctx.beginPath();
                        ctx.roundRect(
                            textRect.x - 2,
                            textRect.y - 2,
                            textRect.width + 4,
                            textRect.height + 4,
                            10
                        );
                        ctx.stroke();
                    }
                    if (this._isEditing) {
                        ctx.fillStyle = 'rgba(255, 255, 200)';
                        ctx.strokeStyle = '#007bff';
                        ctx.lineWidth = 2;
                        ctx.setLineDash([5, 3]);
                        ctx.beginPath();
                        ctx.roundRect(
                            textRect.x - 3,
                            textRect.y - 3,
                            textRect.width + 6,
                            textRect.height + 6,
                            11
                        );
                        ctx.fill();
                        ctx.stroke();
                        if (this._isSelected) {
                            this._drawResizeHandles(ctx, textRect);
                        }
                    }

                    ctx.restore();
                },
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private _wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    private _drawResizeHandles(ctx: CanvasRenderingContext2D, rect: { x: number; y: number; width: number; height: number }) {
        const handleSize = 6;
        const handles = [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width, y: rect.y },
            { x: rect.x, y: rect.y + rect.height },
            { x: rect.x + rect.width, y: rect.y + rect.height }
        ];
        ctx.fillStyle = '#007bff';
        handles.forEach(handle => {
            ctx.beginPath();
            ctx.rect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            ctx.fill();
        });
    }

    public updateTextContent(text: string, color?: string, backgroundColor?: string, textColor?: string, fontSize?: number) {
        this._text = text;
        if (color !== undefined) this._color = color;
        if (backgroundColor !== undefined) this._backgroundColor = backgroundColor;
        if (textColor !== undefined) this._textColor = textColor;
        if (fontSize !== undefined) this._fontSize = fontSize;
        this._adjustSizeToContent();
        this.requestUpdate();
    }

    public delete() {
        this._deselectTextEditMark();
        this._dispatchTextEditMarkDeleted();
    }

    public getPosition() {
        return {
            time: this._time,
            price: this._price,
            text: this._text,
            fontSize: this._fontSize,
            color: this._color,
            backgroundColor: this._backgroundColor,
            textColor: this._textColor,
            width: this._width,
            height: this._height
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