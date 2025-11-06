export class OperableTextMark {
    private _chart: any;
    private _series: any;
    private _time: string;
    private _price: number;
    private _renderer: any;
    private _text: string;

    private _isDragging = false;
    private _dragStartX = 0;
    private _dragStartY = 0;
    private _originalTime: string;
    private _originalPrice: number;
    private _scale = 1;
    private _minScale = 0.5;
    private _maxScale = 3;
    private _hitRadius = 30;
    private _fontSize = 14;
    private _isEditing = false;
    private _editInput: HTMLTextAreaElement | null = null;
    private _isHovered = false;
    private _lastHoverState = false;
    private _cursorVisible = true;
    private _cursorTimer: number | null = null;
    private _originalText: string = '';
    private _isSelected = false;
    private _textColor = '#000000';
    private _isBold = false;
    private _isItalic = false;
    private _fontFamily = 'sans-serif';

    constructor(time: string, price: number, text: string) {
        this._time = time;
        this._price = price;
        this._text = text;
        this._originalTime = time;
        this._originalPrice = price;
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

    attached(param: any) {
        this._chart = param.chart;
        this._series = param.series;
        this._addEventListeners();
        param.requestUpdate();
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

    private _isPointInMark(clientX: number, clientY: number): boolean {
        if (!this._chart || !this._series) return false;
        const chartElement = this._chart.chartElement();
        const rect = chartElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const markX = this._chart.timeScale().timeToCoordinate(this._time);
        const markY = this._series.priceToCoordinate(this._price);
        if (markX == null || markY == null) return false;

        const { width: boxWidth, height: boxHeight } = this._getBoxSize();

        return x >= markX - boxWidth / 2 &&
            x <= markX + boxWidth / 2 &&
            y >= markY - boxHeight / 2 &&
            y <= markY + boxHeight / 2;
    }

    private _onMouseDown(event: MouseEvent) {
        if (event.button !== 0 || this._isEditing) return;
        const isClickInMark = this._isPointInMark(event.clientX, event.clientY);
        if (isClickInMark) {
            this._isDragging = true;
            this._dragStartX = event.clientX;
            this._dragStartY = event.clientY;
            this._originalTime = this._time;
            this._originalPrice = this._price;
            this._selectTextMark(event);
            event.preventDefault();
            event.stopPropagation();
            this._chart.applyOptions({
                handleScroll: false,
                handleScale: false
            });
        } else if (this._isSelected) {
            this._deselectTextMark();
        }
    }

    private _onMouseMove(event: MouseEvent) {
        if (!this._isDragging) {
            const isInMark = this._isPointInMark(event.clientX, event.clientY);
            const newHovered = isInMark;

            if (newHovered !== this._lastHoverState) {
                this._isHovered = newHovered;
                this._lastHoverState = newHovered;
                this._chart.applyOptions({});
            }

            if (this._isHovered) {
                this._chart.chartElement().style.cursor = 'move';
            } else {
                this._chart.chartElement().style.cursor = '';
            }
        } else {
            this._chart.chartElement().style.cursor = 'move';
        }

        if (this._isDragging && !this._isEditing) {
            event.preventDefault();
            event.stopPropagation();
            const deltaX = event.clientX - this._dragStartX;
            const deltaY = event.clientY - this._dragStartY;
            const timeScale = this._chart.timeScale();
            const priceScale = this._series;
            const originalCoordX = timeScale.timeToCoordinate(this._originalTime);
            const originalCoordY = priceScale.priceToCoordinate(this._originalPrice);

            let positionChanged = false;

            if (originalCoordX !== null) {
                const newCoordX = originalCoordX + deltaX;
                const newTime = timeScale.coordinateToTime(newCoordX);
                if (newTime && newTime.toString() !== this._time) {
                    this._time = newTime.toString();
                    positionChanged = true;
                }
            }
            if (originalCoordY !== null) {
                const newCoordY = originalCoordY + deltaY;
                const newPrice = priceScale.coordinateToPrice(newCoordY);
                if (newPrice !== null && newPrice !== this._price) {
                    this._price = newPrice;
                    positionChanged = true;
                }
            }

            if (positionChanged) {
                this._chart.applyOptions({});
            }
        }
    }

    private _onMouseUp(event: MouseEvent) {
        if (this._isDragging) {
            this._isDragging = false;
            this._chart.applyOptions({
                handleScroll: true,
                handleScale: true
            });

            this._updateHoverState(event.clientX, event.clientY);
            event.preventDefault();
            event.stopPropagation();



        }
    }

    private _updateHoverState(clientX: number, clientY: number) {
        const isInMark = this._isPointInMark(clientX, clientY);
        const newHovered = isInMark;

        if (newHovered !== this._isHovered) {
            this._isHovered = newHovered;
            this._chart.applyOptions({});
        }
    }

    private _onDoubleClick(event: MouseEvent) {
        if (this._isPointInMark(event.clientX, event.clientY)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            this._startEditing();
        }
    }

    private _onContextMenu(event: MouseEvent) {
        if (this._isPointInMark(event.clientX, event.clientY)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
    private _onDocumentClick(event: MouseEvent) {

        const isClickOutside = !this._isPointInMark(event.clientX, event.clientY);

        if (isClickOutside && this._isSelected) {
            this._deselectTextMark();
        }
    }



    private _isClickOutsideMark(clientX: number, clientY: number): boolean {
        return !this._isPointInMark(clientX, clientY);
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
            this._chart.applyOptions({});
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
        this._chart.applyOptions({});
    }

    private _startCursorBlink() {
        if (this._cursorTimer) {
            clearInterval(this._cursorTimer);
        }
        this._cursorTimer = window.setInterval(() => {
            this._cursorVisible = !this._cursorVisible;
            this._chart.applyOptions({});
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
        this._chart.applyOptions({});
    }

    private _cancelEditing() {
        this._text = this._originalText;
        this._cleanupEditing();
        this._updateHoverStateAfterEdit();
        this._chart.applyOptions({});
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

    private _selectTextMark(event?: MouseEvent) {
        this._isSelected = true;
        this._dispatchTextMarkSelected(event);
    }

    private _deselectTextMark() {
        this._isSelected = false;
        this._dispatchTextMarkDeselected();
    }

    private _dispatchTextMarkSelected(event?: MouseEvent) {
        if (!this._chart) return;

        const customEvent = new CustomEvent('textMarkSelected', {
            detail: {
                mark: this,
                position: this._getScreenCoordinates(),
                clientX: event?.clientX,
                clientY: event?.clientY,
                text: this._text,
                color: this._textColor,
                fontSize: this._fontSize,
                isBold: this._isBold,
                isItalic: this._isItalic
            },
            bubbles: true
        });

        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _dispatchTextMarkDeselected() {
        if (!this._chart) return;

        const customEvent = new CustomEvent('textMarkDeselected', {
            detail: {
                mark: this
            },
            bubbles: true
        });

        this._chart.chartElement().dispatchEvent(customEvent);
    }

    private _dispatchTextMarkDeleted() {
        if (!this._chart) return;

        const customEvent = new CustomEvent('textMarkDeleted', {
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

    private _getBoxSize(): { width: number, height: number } {
        const scaledFontSize = this._fontSize * this._scale;
        const padding = 8 * this._scale;
        const lineHeight = scaledFontSize * 1.2;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
            return { width: 60 * this._scale, height: 30 * this._scale };
        }

        const fontStyle = `${this._isBold ? 'bold ' : ''}${this._isItalic ? 'italic ' : ''}${scaledFontSize}px ${this._fontFamily}`;
        tempCtx.font = fontStyle;

        const lines = this._text.split('\n');
        let maxWidth = 0;
        lines.forEach(line => {
            const metrics = tempCtx.measureText(line || ' ');
            maxWidth = Math.max(maxWidth, metrics.width);
        });

        const textWidth = Math.max(maxWidth, 40 * this._scale);
        const lineCount = Math.max(lines.length, 1);
        const textHeight = Math.max(lineCount * lineHeight, scaledFontSize);

        return {
            width: textWidth + padding * 2,
            height: textHeight + padding * 2
        };
    }

    updateAllViews() { }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart || !this._series) return;
                    const { x, y } = this._getScreenCoordinates();
                    if (x == null || y == null) return;

                    const scaledFontSize = this._fontSize * this._scale;
                    const padding = 8 * this._scale;
                    const lineHeight = scaledFontSize * 1.2;

                    const { width: boxWidth, height: boxHeight } = this._getBoxSize();

                    ctx.save();

                    const fontStyle = `${this._isBold ? 'bold ' : ''}${this._isItalic ? 'italic ' : ''}${scaledFontSize}px ${this._fontFamily}`;
                    ctx.font = fontStyle;

                    const lines = this._text.split('\n');


                    if (this._isHovered || this._isSelected) {
                        ctx.strokeStyle = this._isSelected ? '#007bff' : 'rgba(0, 123, 255, 0.5)';
                        ctx.lineWidth = this._isSelected ? 2 : 1;
                        ctx.setLineDash(this._isSelected ? [] : [2, 2]);

                        const radius = 4 * this._scale;
                        ctx.beginPath();
                        ctx.moveTo(x - boxWidth / 2 + radius, y - boxHeight / 2);
                        ctx.lineTo(x + boxWidth / 2 - radius, y - boxHeight / 2);
                        ctx.arcTo(x + boxWidth / 2, y - boxHeight / 2, x + boxWidth / 2, y - boxHeight / 2 + radius, radius);
                        ctx.lineTo(x + boxWidth / 2, y + boxHeight / 2 - radius);
                        ctx.arcTo(x + boxWidth / 2, y + boxHeight / 2, x + boxWidth / 2 - radius, y + boxHeight / 2, radius);
                        ctx.lineTo(x - boxWidth / 2 + radius, y + boxHeight / 2);
                        ctx.arcTo(x - boxWidth / 2, y + boxHeight / 2, x - boxWidth / 2, y + boxHeight / 2 - radius, radius);
                        ctx.lineTo(x - boxWidth / 2, y - boxHeight / 2 + radius);
                        ctx.arcTo(x - boxWidth / 2, y - boxHeight / 2, x - boxWidth / 2 + radius, y - boxHeight / 2, radius);
                        ctx.closePath();
                        ctx.stroke();
                    }


                    if (this._isEditing) {
                        ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
                        ctx.strokeStyle = '#007bff';
                        ctx.lineWidth = 2;
                        ctx.setLineDash([5, 3]);

                        const radius = 4 * this._scale;
                        ctx.beginPath();
                        ctx.moveTo(x - boxWidth / 2 + radius, y - boxHeight / 2);
                        ctx.lineTo(x + boxWidth / 2 - radius, y - boxHeight / 2);
                        ctx.arcTo(x + boxWidth / 2, y - boxHeight / 2, x + boxWidth / 2, y - boxHeight / 2 + radius, radius);
                        ctx.lineTo(x + boxWidth / 2, y + boxHeight / 2 - radius);
                        ctx.arcTo(x + boxWidth / 2, y + boxHeight / 2, x + boxWidth / 2 - radius, y + boxHeight / 2, radius);
                        ctx.lineTo(x - boxWidth / 2 + radius, y + boxHeight / 2);
                        ctx.arcTo(x - boxWidth / 2, y + boxHeight / 2, x - boxWidth / 2, y + boxHeight / 2 - radius, radius);
                        ctx.lineTo(x - boxWidth / 2, y - boxHeight / 2 + radius);
                        ctx.arcTo(x - boxWidth / 2, y - boxHeight / 2, x - boxWidth / 2 + radius, y - boxHeight / 2, radius);
                        ctx.closePath();

                        ctx.fill();
                        ctx.stroke();
                    }


                    ctx.fillStyle = this._textColor;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    const totalTextHeight = lines.length * lineHeight;
                    const startY = y - totalTextHeight / 2 + lineHeight / 2;

                    lines.forEach((line, index) => {
                        const textToDraw = line || ' ';
                        ctx.fillText(textToDraw, x, startY + index * lineHeight);
                    });


                    if (this._isEditing && this._cursorVisible) {
                        let cursorX = x;
                        if (lines.length > 0) {
                            const lastLine = lines[lines.length - 1] || ' ';
                            const metrics = ctx.measureText(lastLine);
                            cursorX = x + metrics.width / 2;
                        }

                        const cursorStartY = y - totalTextHeight / 2;
                        const cursorEndY = y + totalTextHeight / 2;

                        ctx.strokeStyle = '#333';
                        ctx.lineWidth = 1;
                        ctx.setLineDash([]);
                        ctx.beginPath();
                        ctx.moveTo(cursorX, cursorStartY);
                        ctx.lineTo(cursorX, cursorEndY);
                        ctx.stroke();
                    }

                    ctx.restore();
                }
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    destroy() {
        this._cleanupEditing();
        this._deselectTextMark();
        this._removeEventListeners();
        if (this._chart) {
            this._chart.chartElement().style.cursor = '';
        }
    }


    public updateStyle(style: {
        color?: string;
        fontSize?: number;
        isBold?: boolean;
        isItalic?: boolean;
    }) {
        if (style.color !== undefined) {
            this._textColor = style.color;
        }
        if (style.fontSize !== undefined) {
            this._fontSize = style.fontSize;
        }
        if (style.isBold !== undefined) {
            this._isBold = style.isBold;
        }
        if (style.isItalic !== undefined) {
            this._isItalic = style.isItalic;
        }

        if (this._chart) {
            this._chart.applyOptions({});
        }
    }

    public delete() {
        this._deselectTextMark();
        this._dispatchTextMarkDeleted();
    }

    public getPosition() {
        return {
            time: this._time,
            price: this._price,
            scale: this._scale,
            text: this._text,
            fontSize: this._fontSize,
            color: this._textColor,
            isBold: this._isBold,
            isItalic: this._isItalic
        };
    }

    public setPosition(time: string, price: number) {
        this._time = time;
        this._price = price;
        if (this._chart) {
            this._chart.applyOptions({});
        }
    }

    public setText(text: string) {
        this._text = text;
        if (this._chart) {
            this._chart.applyOptions({});
        }
    }
}