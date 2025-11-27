import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";
import { MarkType } from "../../types";

export class SignPostMark implements IGraph, IMarkStyle {
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
    private markType: MarkType = MarkType.SignPost;
    private _lineLength: number = 100;
    private _isEditing = false;
    private _editInput: HTMLTextAreaElement | null = null;
    private _isSelected = false;
    private _isHovered = false;
    private _cursorVisible = true;
    private _cursorTimer: number | null = null;
    private _originalText: string = '';
    private _isDragging: boolean = false;

    constructor(
        time: string,
        price: number,
        text: string = "",
        color: string = '#FF6B6B',
        backgroundColor: string = '#FFFFFF',
        textColor: string = '#333333',
        fontSize: number = 12,
        lineWidth: number = 2,
    ) {
        this._time = time;
        this._price = price;
        this._text = text;
        this._color = color;
        this._backgroundColor = backgroundColor;
        this._textColor = textColor;
        this._fontSize = fontSize;
        this._lineWidth = lineWidth;
        this._originalText = text;
        this._onMouseDown = this._onMouseDown.bind(this);
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
            document.addEventListener('keydown', this._onKeyDown);
            document.addEventListener('click', this._onDocumentClick);
        }
    }

    private _removeEventListeners() {
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('click', this._onDocumentClick);
        if (!this._chart) return;
        const chartElement = this._chart.chartElement();
        if (chartElement) {
            chartElement.removeEventListener('mousedown', this._onMouseDown, true);
            chartElement.removeEventListener('dblclick', this._onDoubleClick, true);
            chartElement.removeEventListener('contextmenu', this._onContextMenu, true);
        }
    }

    updateAllViews() { }

    updatePosition(time: string, price: number) {
        this._time = time;
        this._price = price;
        this.requestUpdate();
    }

    updateText(text: string) {
        this._text = text;
        this.requestUpdate();
    }

    setPreviewMode(isPreview: boolean) {
        this.requestUpdate();
    }

    setShowLabel(show: boolean) {
        this.requestUpdate();
    }

    setDragging(dragging: boolean) {
        this._isDragging = dragging;
        this.requestUpdate();
    }

    public dragByPixels(deltaX: number, deltaY: number) {
        if (isNaN(deltaX) || isNaN(deltaY)) {
            return;
        }
        if (!this._chart || !this._series) return;
        const timeScale = this._chart.timeScale();
        const currentTime = parseFloat(this._time);
        const currentX = timeScale.timeToCoordinate(currentTime);
        if (currentX === null) return;
        const newX = currentX + deltaX;
        const newTime = timeScale.coordinateToTime(newX);
        if (newTime !== null) {
            const snappedData = this.snapToNearestBar(newTime);
            this._time = snappedData.time.toString();
            this._price = snappedData.price;
            if (deltaY !== 0) {
                this._lineLength = Math.max(10, this._lineLength - deltaY);
            }
            this.requestUpdate();
        }
    }

    isPointNearLabel(x: number, y: number, threshold: number = 15): boolean {
        if (!this._chart || !this._series) return false;
        const currentTime = parseFloat(this._time);
        const labelX = this._chart.timeScale().timeToCoordinate(currentTime);
        const labelY = this._series.priceToCoordinate(this._price);
        if (labelX === null || labelY === null) return false;
        const pointerLength = this._lineLength;
        const padding = 8;
        const textWidth = this._text.length * this._fontSize * 0.6;
        const textHeight = this._fontSize;
        const bubbleRect = {
            x: labelX - textWidth / 2 - padding,
            y: labelY - pointerLength - textHeight - padding * 2,
            width: textWidth + padding * 2,
            height: textHeight + padding * 2
        };
        const inBubble = x >= bubbleRect.x &&
            x <= bubbleRect.x + bubbleRect.width &&
            y >= bubbleRect.y &&
            y <= bubbleRect.y + bubbleRect.height;
        if (inBubble) return true;
        const lineThreshold = 8;
        const inLine = Math.abs(x - labelX) <= lineThreshold &&
            y >= labelY - pointerLength &&
            y <= labelY;
        return inLine;
    }

    private _isPointInBubble(clientX: number, clientY: number): boolean {
        if (!this._chart || !this._series) return false;
        const chartElement = this._chart.chartElement();
        const rect = chartElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        return this.isPointNearLabel(x, y, 20);
    }

    private _onMouseDown(event: MouseEvent) {
        if (event.button !== 0 || this._isEditing) return;
        const isClickInBubble = this._isPointInBubble(event.clientX, event.clientY);
        if (isClickInBubble) {
            if (!this._isSelected) {
                this._selectSignPostMark(event);
            } else {
                if (!this._isEditing) {
                    this._startEditing();
                }
            }
        } else if (this._isSelected) {
            this._deselectSignPostMark();
        }
    }

    private _onDoubleClick(event: MouseEvent) {
        if (this._isPointInBubble(event.clientX, event.clientY)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            if (!this._isSelected) {
                this._selectSignPostMark(event);
            }
            this._showEditorModal(event);
        }
    }

    private _showEditorModal(event?: MouseEvent) {
        if (!this._chart) return;
        this._deselectSignPostMark();
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
        const customEvent = new CustomEvent('signPostMarkEditorRequest', {
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
            this._deselectSignPostMark();
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
    }

    private _selectSignPostMark(event?: MouseEvent) {
        this._isSelected = true;
        this._dispatchSignPostMarkSelected(event);
        this.requestUpdate();
    }

    private _deselectSignPostMark() {
        this._isSelected = false;
        this._dispatchSignPostMarkDeselected();
        this.requestUpdate();
    }

    private _dispatchSignPostMarkSelected(event?: MouseEvent) {
        if (!this._chart) return;
        const customEvent = new CustomEvent('signPostMarkSelected', {
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

    private _dispatchSignPostMarkDeselected() {
        if (!this._chart) return;
        const customEvent = new CustomEvent('signPostMarkDeselected', {
            detail: {
                mark: this
            },
            bubbles: true
        });
        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _dispatchSignPostMarkDeleted() {
        if (!this._chart) return;
        const customEvent = new CustomEvent('signPostMarkDeleted', {
            detail: {
                mark: this
            },
            bubbles: true
        });
        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _getScreenCoordinates() {
        const currentTime = parseFloat(this._time);
        const labelX = this._chart.timeScale().timeToCoordinate(currentTime);
        const labelY = this._series.priceToCoordinate(this._price);
        return { x: labelX, y: labelY };
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
                    if (!ctx || !this._chart || !this._series) {
                        return;
                    }

                    const currentTime = parseFloat(this._time);
                    const labelX = this._chart.timeScale().timeToCoordinate(currentTime);
                    const labelY = this._series.priceToCoordinate(this._price);

                    if (labelX === null || labelY === null) {
                        return;
                    }
                    ctx.save();
                    ctx.globalAlpha = 1.0;
                    const pointerLength = this._lineLength;
                    const padding = 8;
                    const textWidth = this._text.length * this._fontSize * 0.6;
                    const textHeight = this._fontSize;
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = 2;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 2;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.beginPath();
                    ctx.moveTo(labelX, labelY);
                    ctx.lineTo(labelX, labelY - pointerLength);
                    ctx.stroke();
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    const bubbleRect = {
                        x: labelX - textWidth / 2 - padding,
                        y: labelY - pointerLength - textHeight - padding * 2,
                        width: textWidth + padding * 2,
                        height: textHeight + padding * 2
                    };
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 2;
                    ctx.fillStyle = this._backgroundColor;
                    ctx.strokeStyle = this._color;
                    ctx.lineWidth = this._lineWidth;
                    ctx.beginPath();
                    ctx.roundRect(bubbleRect.x, bubbleRect.y, bubbleRect.width, bubbleRect.height, 4);
                    ctx.fill();
                    ctx.stroke();
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.fillStyle = this._textColor;
                    ctx.font = `${this._fontSize}px Arial, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                        this._text,
                        labelX,
                        bubbleRect.y + bubbleRect.height / 2
                    );
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

    getText(): string {
        return this._text;
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
            text: this._text,
        };
    }

    getBounds() {
        if (!this._chart || !this._series) return null;

        const currentTime = parseFloat(this._time);
        const labelX = this._chart.timeScale().timeToCoordinate(currentTime);
        const labelY = this._series.priceToCoordinate(this._price);

        if (labelX === null || labelY === null) return null;
        const pointerLength = this._lineLength;
        const padding = 8;
        const textWidth = this._text.length * this._fontSize * 0.6;
        const textHeight = this._fontSize;
        return {
            x: labelX,
            y: labelY,
            minX: labelX - textWidth / 2 - padding,
            maxX: labelX + textWidth / 2 + padding,
            minY: labelY - pointerLength - textHeight - padding * 2,
            maxY: labelY
        };
    }

    /**
    * 吸附到最近的K线 - 修复时间格式处理
    */
    public snapToNearestBar(targetTime: number): { time: number; price: number } {
        if (!this._series) {
            return { time: targetTime, price: this._price };
        }
        try {
            const seriesData = this._series.data();
            if (!seriesData || seriesData.length === 0) {
                return { time: targetTime, price: this._price };
            }
            let nearestBar = null;
            let minTimeDiff = Number.MAX_SAFE_INTEGER;

            for (const bar of seriesData) {
                const barTimestamp = bar.time;
                const timeDiff = Math.abs(barTimestamp - targetTime);
                if (timeDiff < minTimeDiff) {
                    minTimeDiff = timeDiff;
                    nearestBar = bar;
                }
            }
            if (nearestBar) {
                return {
                    time: nearestBar.time,
                    price: nearestBar.close || nearestBar.value || this._price
                };
            }
        } catch (error) {
        }

        return { time: targetTime, price: this._price };
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
        this._deselectSignPostMark();
        this._dispatchSignPostMarkDeleted();
    }

    public getPosition() {
        return {
            time: this._time,
            price: this._price,
            text: this._text,
            fontSize: this._fontSize,
            color: this._color,
            backgroundColor: this._backgroundColor,
            textColor: this._textColor
        };
    }

    destroy() {
        this._cleanupEditing();
        this._deselectSignPostMark();
        this._removeEventListeners();
        if (this._chart) {
            this._chart.chartElement().style.cursor = '';
        }
    }

    public static createWithSnap(time: string, price: number, text?: string): SignPostMark {
        const tempMark = new SignPostMark(time, price, text);
        const snappedData = tempMark.snapToNearestBar(parseFloat(time));
        return new SignPostMark(snappedData.time.toString(), snappedData.price, text);
    }
}