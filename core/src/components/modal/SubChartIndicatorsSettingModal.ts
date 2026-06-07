import { I18n } from '../../i18n';
import { IIndicatorInfo } from '../../Indicators/subchart/IIndicator';
import { ThemeConfig } from '../../theme';
import { SubChartIndicatorType } from '../../types';

export interface SubChartIndicatorsSettingModalOptions {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (params: IIndicatorInfo[]) => void;
    initialParams: IIndicatorInfo[];
    theme?: ThemeConfig;
    parentRef?: HTMLElement | null;
    indicatorType: SubChartIndicatorType | null;
    i18n: I18n;
}

interface IndicatorConstraints {
    minParams: number;
    maxParams: number;
    allowAdd: boolean;
    allowDelete: boolean;
    defaultParams: IIndicatorInfo[];
}

type CSSStyles = Partial<CSSStyleDeclaration>;

export class SubChartIndicatorsSettingModal {
    private container: HTMLElement | null = null;
    private options: SubChartIndicatorsSettingModalOptions;
    private params: IIndicatorInfo[] = [];
    private modalPosition: { x: number; y: number } = { x: 0, y: 0 };
    private isDragging: boolean = false;
    private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
    private modalRef: HTMLDivElement | null = null;
    private headerRef: HTMLDivElement | null = null;
    private boundHandleMouseMove: (e: MouseEvent) => void;
    private boundHandleMouseUp: () => void;
    private paramsListRef: HTMLDivElement | null = null;

    constructor(options: SubChartIndicatorsSettingModalOptions) {
        this.options = options;
        this.params = [...options.initialParams];
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);

        if (options.isOpen) {
            this.calculatePosition();
            this.render();
        }
    }

    private getIndicatorTitle(): string {
        const type = this.options.indicatorType;
        const i18n = this.options.i18n;

        switch (type) {
            case SubChartIndicatorType.RSI:
                return i18n.indicators?.rsi || 'RSI';
            case SubChartIndicatorType.MACD:
                return i18n.indicators?.macd || 'MACD';
            case SubChartIndicatorType.VOLUME:
                return i18n.indicators?.volume || 'VOLUME';
            case SubChartIndicatorType.SAR:
                return i18n.indicators?.sar || 'SAR';
            case SubChartIndicatorType.KDJ:
                return i18n.indicators?.kdj || 'KDJ';
            case SubChartIndicatorType.ATR:
                return i18n.indicators?.atr || 'ATR';
            case SubChartIndicatorType.STOCHASTIC:
                return i18n.indicators?.stochastic || 'STOCHASTIC';
            case SubChartIndicatorType.CCI:
                return i18n.indicators?.cci || 'CCI';
            case SubChartIndicatorType.BBWIDTH:
                return i18n.indicators?.bbwidth || 'BBWIDTH';
            case SubChartIndicatorType.ADX:
                return i18n.indicators?.adx || 'ADX';
            case SubChartIndicatorType.OBV:
                return i18n.indicators?.obv || 'OBV';
            default:
                return i18n.subChartIndicators || '副图指标设置';
        }
    }

    private getRandomColor(): string {
        const colors = [
            this.options.theme?.chart?.lineColor || '#2962FF',
            this.options.theme?.chart?.upColor || '#00C087',
            this.options.theme?.chart?.downColor || '#FF5B5A',
            '#4ECDC4',
            '#45B7D1',
            '#96CEB4',
            '#FFEAA7',
            '#DDA0DD',
            '#FF6B6B',
            '#556270'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    private getIndicatorConstraints(type: SubChartIndicatorType | null): IndicatorConstraints {
        const i18n = this.options.i18n;

        switch (type) {
            case SubChartIndicatorType.RSI:
                return {
                    minParams: 1,
                    maxParams: 1,
                    allowAdd: false,
                    allowDelete: false,
                    defaultParams: [{ paramValue: 14, paramName: i18n.modal?.parameterName || 'Period', lineColor: '#2962FF', lineWidth: 1, data: [] }]
                };
            case SubChartIndicatorType.MACD:
                return {
                    minParams: 3,
                    maxParams: 3,
                    allowAdd: false,
                    allowDelete: false,
                    defaultParams: [
                        { paramValue: 12, paramName: i18n.indicators?.ma || 'Fast', lineColor: '#2962FF', lineWidth: 1, data: [] },
                        { paramValue: 26, paramName: i18n.indicators?.ema || 'Slow', lineColor: '#FF6B6B', lineWidth: 1, data: [] },
                        { paramValue: 9, paramName: i18n.indicators?.macd || 'Signal', lineColor: '#00C087', lineWidth: 1, data: [] }
                    ]
                };
            case SubChartIndicatorType.VOLUME:
                return {
                    minParams: 0,
                    maxParams: 0,
                    allowAdd: false,
                    allowDelete: false,
                    defaultParams: []
                };
            case SubChartIndicatorType.SAR:
                return {
                    minParams: 2,
                    maxParams: 2,
                    allowAdd: false,
                    allowDelete: false,
                    defaultParams: [
                        { paramValue: 0.02, paramName: i18n.indicators?.sar || 'Step', lineColor: '#2962FF', lineWidth: 1, data: [] },
                        { paramValue: 0.2, paramName: i18n.indicators?.sar || 'Max', lineColor: '#FF6B6B', lineWidth: 1, data: [] }
                    ]
                };
            case SubChartIndicatorType.KDJ:
                return {
                    minParams: 3,
                    maxParams: 3,
                    allowAdd: false,
                    allowDelete: false,
                    defaultParams: [
                        { paramValue: 9, paramName: 'K', lineColor: '#2962FF', lineWidth: 1, data: [] },
                        { paramValue: 3, paramName: 'D', lineColor: '#FF6B6B', lineWidth: 1, data: [] },
                        { paramValue: 3, paramName: 'J', lineColor: '#00C087', lineWidth: 1, data: [] }
                    ]
                };
            case SubChartIndicatorType.ATR:
                return {
                    minParams: 1,
                    maxParams: 1,
                    allowAdd: false,
                    allowDelete: false,
                    defaultParams: [{ paramValue: 14, paramName: i18n.modal?.parameterName || 'Period', lineColor: '#2962FF', lineWidth: 1, data: [] }]
                };
            case SubChartIndicatorType.STOCHASTIC:
                return {
                    minParams: 3,
                    maxParams: 3,
                    allowAdd: false,
                    allowDelete: false,
                    defaultParams: [
                        { paramValue: 14, paramName: 'K', lineColor: '#2962FF', lineWidth: 1, data: [] },
                        { paramValue: 3, paramName: 'D', lineColor: '#FF6B6B', lineWidth: 1, data: [] },
                        { paramValue: 3, paramName: i18n.indicators?.stochastic || 'Smooth', lineColor: '#00C087', lineWidth: 1, data: [] }
                    ]
                };
            case SubChartIndicatorType.CCI:
                return {
                    minParams: 1,
                    maxParams: 1,
                    allowAdd: false,
                    allowDelete: false,
                    defaultParams: [{ paramValue: 20, paramName: i18n.modal?.parameterName || 'Period', lineColor: '#2962FF', lineWidth: 1, data: [] }]
                };
            case SubChartIndicatorType.BBWIDTH:
                return {
                    minParams: 1,
                    maxParams: 1,
                    allowAdd: false,
                    allowDelete: false,
                    defaultParams: [{ paramValue: 20, paramName: i18n.modal?.parameterName || 'Period', lineColor: '#2962FF', lineWidth: 1, data: [] }]
                };
            case SubChartIndicatorType.ADX:
                return {
                    minParams: 1,
                    maxParams: 1,
                    allowAdd: false,
                    allowDelete: false,
                    defaultParams: [{ paramValue: 14, paramName: i18n.modal?.parameterName || 'Period', lineColor: '#2962FF', lineWidth: 1, data: [] }]
                };
            case SubChartIndicatorType.OBV:
                return {
                    minParams: 0,
                    maxParams: 0,
                    allowAdd: false,
                    allowDelete: false,
                    defaultParams: []
                };
            default:
                return {
                    minParams: 1,
                    maxParams: 5,
                    allowAdd: true,
                    allowDelete: true,
                    defaultParams: []
                };
        }
    }

    private addIndicatorParam = (): void => {
        const constraints = this.getIndicatorConstraints(this.options.indicatorType);
        if (this.params.length >= constraints.maxParams || !constraints.allowAdd) return;

        const usedValues = this.params.map(p => p.paramValue);
        const availableValues = [6, 12, 14, 24, 26, 9, 20].filter(v => !usedValues.includes(v));
        if (availableValues.length === 0) return;

        const randomColor = this.getRandomColor();
        const newValue = availableValues[0];
        const newParam: IIndicatorInfo = {
            paramName: `${this.options.i18n.modal?.parameterName || 'Param'}${newValue}`,
            paramValue: newValue,
            lineColor: randomColor,
            lineWidth: 1,
            data: []
        };
        this.params = [...this.params, newParam];
        this.renderParamsList();
    };

    private removeIndicatorParam = (paramIndex: number): void => {
        const constraints = this.getIndicatorConstraints(this.options.indicatorType);
        if (this.params.length <= constraints.minParams || !constraints.allowDelete) return;

        const newParams = [...this.params];
        newParams.splice(paramIndex, 1);
        this.params = newParams;
        this.renderParamsList();
    };

    private updateIndicatorName = (paramIndex: number, name: string): void => {
        const newParams = [...this.params];
        newParams[paramIndex] = { ...newParams[paramIndex], paramName: name };
        this.params = newParams;
    };

    private updateIndicatorValue = (paramIndex: number, value: number): void => {
        const newParams = [...this.params];
        newParams[paramIndex] = { ...newParams[paramIndex], paramValue: value };
        this.params = newParams;
    };

    private updateIndicatorColor = (paramIndex: number, color: string): void => {
        const newParams = [...this.params];
        newParams[paramIndex] = { ...newParams[paramIndex], lineColor: color };
        this.params = newParams;
    };

    private updateIndicatorLineWidth = (paramIndex: number, lineWidth: number): void => {
        const newParams = [...this.params];
        newParams[paramIndex] = { ...newParams[paramIndex], lineWidth };
        this.params = newParams;
    };

    private handleConfirm = (): void => {
        this.options.onConfirm(this.params);
    };

    private handleCancel = (): void => {
        this.params = [...this.options.initialParams];
        this.options.onClose();
    };

    private calculatePosition(): void {
        const parentEl = this.options.parentRef;
        if (parentEl) {
            const parentRect = parentEl.getBoundingClientRect();
            this.modalPosition = {
                x: Math.max(10, parentRect.left + (parentRect.width - 450) / 2),
                y: Math.max(10, parentRect.top + (parentRect.height - 500) / 2)
            };
        } else {
            this.modalPosition = {
                x: Math.max(10, (window.innerWidth - 450) / 2),
                y: Math.max(10, (window.innerHeight - 500) / 2)
            };
        }
    }

    private handleMouseDown = (e: MouseEvent): void => {
        if (e.target === this.headerRef || this.headerRef?.contains(e.target as Node)) {
            this.isDragging = true;
            const rect = this.modalRef!.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            e.preventDefault();
            document.addEventListener('mousemove', this.boundHandleMouseMove);
            document.addEventListener('mouseup', this.boundHandleMouseUp);
        }
    };

    private handleMouseMove(e: MouseEvent): void {
        if (this.isDragging) {
            const newX = e.clientX - this.dragOffset.x;
            const newY = e.clientY - this.dragOffset.y;
            const maxX = window.innerWidth - 450;
            const maxY = window.innerHeight - 500;
            this.modalPosition = {
                x: Math.max(10, Math.min(newX, maxX)),
                y: Math.max(10, Math.min(newY, maxY))
            };
            this.updateModalPosition();
        }
    }

    private handleMouseUp(): void {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.boundHandleMouseMove);
        document.removeEventListener('mouseup', this.boundHandleMouseUp);
    }

    private handleOverlayClick = (e: MouseEvent): void => {
        if (e.target === e.currentTarget) {
            this.handleCancel();
        }
    };

    private handleKeyPress = (e: KeyboardEvent): void => {
        e.stopPropagation();
        if (e.key === 'Enter' && e.ctrlKey) {
            this.handleConfirm();
        } else if (e.key === 'Escape') {
            this.handleCancel();
        }
    };

    private updateModalPosition(): void {
        if (this.modalRef) {
            this.modalRef.style.left = `${this.modalPosition.x}px`;
            this.modalRef.style.top = `${this.modalPosition.y}px`;
        }
    }

    private renderParamsList(): void {
        if (!this.paramsListRef) return;
        this.paramsListRef.innerHTML = '';
        const styles = this.getStyles();
        const constraints = this.getIndicatorConstraints(this.options.indicatorType);

        this.params.forEach((param, paramIndex) => {
            const item = this.createElement('div', 'indicator-item', styles.indicatorItem);

            const nameInput = this.createElement('input', 'name-input', styles.input);
            nameInput.type = 'text';
            nameInput.value = param.paramName;
            nameInput.placeholder = this.options.i18n.modal?.parameterName || '参数名';
            nameInput.addEventListener('change', (e) => {
                this.updateIndicatorName(paramIndex, (e.target as HTMLInputElement).value);
            });
            item.appendChild(nameInput);

            const valueInput = this.createElement('input', 'value-input', styles.input);
            valueInput.type = 'number';
            valueInput.value = param.paramValue.toString();
            valueInput.min = "1";
            valueInput.max = "100";
            valueInput.placeholder = this.options.i18n.modal?.parameterValue || '数值';
            valueInput.addEventListener('change', (e) => {
                this.updateIndicatorValue(paramIndex, Number((e.target as HTMLInputElement).value));
            });
            item.appendChild(valueInput);

            const widthSelect = this.createElement('select', 'line-width-select', styles.lineWidthSelect);
            [1, 2, 3, 4, 5].forEach(w => {
                const option = this.createElement('option', '');
                option.value = w.toString();
                option.textContent = `${w}px`;
                if (param.lineWidth === w) option.selected = true;
                widthSelect.appendChild(option);
            });
            widthSelect.addEventListener('change', (e) => {
                this.updateIndicatorLineWidth(paramIndex, Number((e.target as HTMLSelectElement).value));
            });
            item.appendChild(widthSelect);

            const colorContainer = this.createElement('div', 'color-picker-container', styles.colorPickerContainer);
            const colorDisplay = this.createElement('div', 'color-display');
            this.applyStyles(colorDisplay, { ...styles.colorDisplay, backgroundColor: param.lineColor });
            const colorInput = this.createElement('input', 'color-input', styles.colorInput);
            colorInput.type = 'color';
            colorInput.value = param.lineColor;
            colorInput.addEventListener('change', (e) => {
                const newColor = (e.target as HTMLInputElement).value;
                colorDisplay.style.backgroundColor = newColor;
                this.updateIndicatorColor(paramIndex, newColor);
            });
            colorContainer.appendChild(colorDisplay);
            colorContainer.appendChild(colorInput);
            item.appendChild(colorContainer);

            if (constraints.allowDelete) {
                const deleteBtn = this.createElement('button', 'delete-btn',
                    this.params.length <= constraints.minParams ? styles.deleteButtonDisabled : styles.deleteButton
                );
                deleteBtn.textContent = '×';
                (deleteBtn as HTMLButtonElement).disabled = this.params.length <= constraints.minParams;
                deleteBtn.title = this.params.length <= constraints.minParams ?
                    `${this.options.i18n.modal?.keepAtLeastOne || '至少保留'}${constraints.minParams}${this.options.i18n.modal?.parameterName || '个参数'}` :
                    (this.options.i18n.modal?.deleteParameter || "删除");
                deleteBtn.addEventListener('click', () => this.removeIndicatorParam(paramIndex));
                item.appendChild(deleteBtn);
            }

            this.paramsListRef!.appendChild(item);
        });
    }

    private getStyles(): Record<string, CSSStyles> {
        const theme = this.options.theme;
        const isDragging = this.isDragging;

        return {
            modalOverlay: {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                zIndex: '9999',
                background: 'transparent',
            },
            modalContent: {
                position: 'fixed',
                left: `${this.modalPosition.x}px`,
                top: `${this.modalPosition.y}px`,
                background: theme?.toolbar?.background || '#fafafa',
                border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
                borderRadius: '8px',
                padding: '0',
                width: '450px',
                maxWidth: '90vw',
                height: '500px',
                maxHeight: '80vh',
                zIndex: '10000',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                cursor: isDragging ? 'grabbing' : 'default',
                userSelect: isDragging ? 'none' : 'auto',
                display: 'flex',
                flexDirection: 'column',
            },
            modalHeader: {
                padding: '16px 16px 12px 16px',
                borderBottom: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
                cursor: 'grab',
                userSelect: 'none',
                flexShrink: '0',
            },
            modalTitle: {
                fontSize: '14px',
                fontWeight: 'bold',
                color: theme?.layout?.textColor || '#000000',
                margin: '0',
            },
            modalBody: {
                padding: '16px',
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            },
            indicatorsList: {
                marginBottom: '16px',
                flex: '1',
                overflowY: 'auto',
                overflowX: 'hidden',
            },
            indicatorItem: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                padding: '8px',
                background: theme?.toolbar?.background || '#fafafa',
                border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
                borderRadius: '4px',
            },
            input: {
                width: '80px',
                padding: '4px 8px',
                background: theme?.toolbar?.background || '#fafafa',
                color: theme?.layout?.textColor || '#000000',
                border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
                borderRadius: '4px',
                fontSize: '12px',
            },
            lineWidthSelect: {
                width: '60px',
                padding: '4px 8px',
                background: theme?.toolbar?.background || '#fafafa',
                color: theme?.layout?.textColor || '#000000',
                border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
                borderRadius: '4px',
                fontSize: '12px',
            },
            colorPickerContainer: {
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                position: 'relative',
            },
            colorDisplay: {
                width: '24px',
                height: '24px',
                border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
                borderRadius: '4px',
                cursor: 'pointer',
            },
            colorInput: {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '24px',
                height: '24px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                opacity: '0',
            },
            deleteButton: {
                background: 'transparent',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '0',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme?.chart?.downColor || '#ff4d4f',
            },
            deleteButtonDisabled: {
                background: 'transparent',
                border: 'none',
                fontSize: '16px',
                padding: '0',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: `${theme?.toolbar?.border || '#d9d9d9'}`,
                cursor: 'not-allowed',
            },
            addButton: {
                width: '100%',
                background: 'transparent',
                color: theme?.chart?.lineColor || '#2962FF',
                border: `2px dashed ${theme?.toolbar?.border || '#d9d9d9'}`,
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '12px',
                cursor: 'pointer',
                marginBottom: '16px',
                flexShrink: '0',
            },
            addButtonDisabled: {
                width: '100%',
                background: 'transparent',
                color: `${theme?.toolbar?.border || '#d9d9d9'}`,
                border: `2px dashed ${theme?.toolbar?.border || '#d9d9d9'}`,
                borderRadius: '4px',
                padding: '8px 16px',
                fontSize: '12px',
                cursor: 'not-allowed',
                marginBottom: '16px',
                flexShrink: '0',
            },
            modalActions: {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                flexShrink: '0',
            },
            cancelButton: {
                background: 'transparent',
                color: theme?.layout?.textColor || '#000000',
                border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
            },
            confirmButton: {
                background: theme?.toolbar?.button?.active || '#2962FF',
                color: theme?.toolbar?.button?.activeTextColor || '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
            },
            hintText: {
                fontSize: '10px',
                color: `${theme?.layout?.textColor || '#000000'}80`,
                marginTop: '8px',
                textAlign: 'center',
                flexShrink: '0',
            },
        };
    }

    private applyStyles(element: HTMLElement, styles: CSSStyles): void {
        for (const [key, value] of Object.entries(styles)) {
            if (value !== undefined) {
                (element.style as any)[key] = value;
            }
        }
    }

    private createElement<K extends keyof HTMLElementTagNameMap>(
        tag: K,
        className?: string,
        styles?: CSSStyles
    ): HTMLElementTagNameMap[K] {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (styles) this.applyStyles(element, styles);
        return element;
    }

    private injectScrollbarStyles(): void {
        const styleId = 'subchart-indicators-modal-styles';
        if (document.getElementById(styleId)) return;

        const theme = this.options.theme;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .subchart-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .subchart-scrollbar::-webkit-scrollbar-track {
                background: ${theme?.toolbar?.background || '#fafafa'};
                border-radius: 3px;
            }
            .subchart-scrollbar::-webkit-scrollbar-thumb {
                background: ${theme?.toolbar?.border || '#d9d9d9'};
                border-radius: 3px;
            }
            .subchart-scrollbar::-webkit-scrollbar-thumb:hover {
                background: ${theme?.layout?.textColor || '#000000'}80;
            }
        `;
        document.head.appendChild(style);
    }

    private render(): void {
        if (this.container) {
            this.destroy();
        }

        this.injectScrollbarStyles();
        this.container = this.createElement('div', 'subchart-indicators-modal-overlay');
        const styles = this.getStyles();
        this.applyStyles(this.container, styles.modalOverlay);

        this.modalRef = this.createElement('div', 'subchart-indicators-modal-content', styles.modalContent);
        this.modalRef.addEventListener('mousedown', this.handleMouseDown as EventListener);
        this.modalRef.addEventListener('keydown', this.handleKeyPress as EventListener);

        this.headerRef = this.createElement('div', 'subchart-indicators-modal-header', styles.modalHeader);
        const title = this.createElement('div', 'subchart-indicators-modal-title', styles.modalTitle);
        title.textContent = `${this.getIndicatorTitle()} ${this.options.i18n.systemSettings?.setting || '设置'}`;
        this.headerRef.appendChild(title);
        this.modalRef.appendChild(this.headerRef);

        const body = this.createElement('div', 'subchart-indicators-modal-body', styles.modalBody);

        this.paramsListRef = this.createElement('div', 'subchart-scrollbar', styles.indicatorsList);
        this.renderParamsList();
        body.appendChild(this.paramsListRef);

        const constraints = this.getIndicatorConstraints(this.options.indicatorType);
        const addBtn = this.createElement('button', 'add-btn',
            this.params.length >= constraints.maxParams || !constraints.allowAdd ? styles.addButtonDisabled : styles.addButton
        );
        (addBtn as HTMLButtonElement).disabled = this.params.length >= constraints.maxParams || !constraints.allowAdd;

        if (this.params.length >= constraints.maxParams) {
            addBtn.textContent = `${this.options.i18n.modal?.maximumParameters || '已达到最大参数数量'}(${constraints.maxParams}${this.options.i18n.modal?.parameterName || '个'})`;
        } else if (!constraints.allowAdd) {
            addBtn.textContent = this.options.i18n.modal?.keepAtLeastOne || "不允许添加参数";
        } else {
            addBtn.textContent = `+ ${this.options.i18n.modal?.addParameter || "添加参数"}`;
        }
        addBtn.title = this.params.length >= constraints.maxParams ?
            `${this.options.i18n.modal?.maximumParameters || '最多允许'}${constraints.maxParams}${this.options.i18n.modal?.parameterName || '个参数'}` :
            (!constraints.allowAdd ? this.options.i18n.modal?.keepAtLeastOne || "不允许添加参数" : this.options.i18n.modal?.addParameter || "添加参数");
        addBtn.addEventListener('click', this.addIndicatorParam);
        body.appendChild(addBtn);

        const actions = this.createElement('div', 'modal-actions', styles.modalActions);
        const cancelBtn = this.createElement('button', 'cancel-btn', styles.cancelButton);
        cancelBtn.textContent = this.options.i18n.systemSettings?.cancel || '取消';
        cancelBtn.addEventListener('click', () => this.handleCancel());
        actions.appendChild(cancelBtn);

        const confirmBtn = this.createElement('button', 'confirm-btn', styles.confirmButton);
        confirmBtn.textContent = this.options.i18n.systemSettings?.confirm || '确定';
        confirmBtn.addEventListener('click', () => this.handleConfirm());
        actions.appendChild(confirmBtn);
        body.appendChild(actions);

        const hintText = this.createElement('div', 'hint-text', styles.hintText);
        hintText.textContent = `${this.options.i18n.tooltips?.ctrlEnterToConfirm || 'Ctrl+Enter: 确认'}, ${this.options.i18n.tooltips?.escToCancel || 'Esc: 取消'}, ${this.options.i18n.modal?.dragToMove || '拖动标题栏移动'}`;
        body.appendChild(hintText);

        this.modalRef.appendChild(body);
        this.container.appendChild(this.modalRef);
        this.container.addEventListener('click', this.handleOverlayClick as EventListener);
        document.body.appendChild(this.container);
    }

    public update(options: Partial<SubChartIndicatorsSettingModalOptions>): void {
        if (options.initialParams !== undefined) {
            this.params = [...options.initialParams];
        }
        Object.assign(this.options, options);

        if (options.isOpen !== undefined) {
            if (options.isOpen) {
                this.calculatePosition();
                this.render();
            } else {
                this.destroy();
            }
        } else if (this.options.isOpen) {
            this.render();
        }
    }

    public destroy(): void {
        if (this.container) {
            document.removeEventListener('mousemove', this.boundHandleMouseMove);
            document.removeEventListener('mouseup', this.boundHandleMouseUp);
            this.container.remove();
            this.container = null;
        }
        this.modalRef = null;
        this.headerRef = null;
        this.paramsListRef = null;
    }
}