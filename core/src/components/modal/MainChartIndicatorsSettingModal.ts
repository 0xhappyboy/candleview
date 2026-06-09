import { MainChartIndicatorType } from '../../types';
import { MainChartIndicatorInfo, MainChartIndicatorParam } from '../../Indicators/mainchart/MainChartIndicatorInfo';
import { ThemeConfig } from '../../theme';
import { I18n } from '../../i18n';

export interface MainChartIndicatorsSettingModalOptions {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (indicator: MainChartIndicatorInfo) => void;
    initialIndicator?: MainChartIndicatorInfo | null;
    theme?: ThemeConfig;
    parentRef?: HTMLElement | null;
    indicatorType?: MainChartIndicatorType | null;
    i18n: I18n;
}

export class MainChartIndicatorsSettingModal {
    private container: HTMLElement | null = null;
    private options: MainChartIndicatorsSettingModalOptions;
    private indicator: MainChartIndicatorInfo | null = null;
    private modalPosition: { x: number; y: number } = { x: 0, y: 0 };
    private isDragging: boolean = false;
    private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
    private modalRef: HTMLDivElement | null = null;
    private headerRef: HTMLDivElement | null = null;
    private boundHandleMouseMove: (e: MouseEvent) => void;
    private boundHandleMouseUp: () => void;
    private paramsListRef: HTMLDivElement | null = null;

    constructor(options: MainChartIndicatorsSettingModalOptions) {
        this.options = options;
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        this.boundHandleMouseUp = this.handleMouseUp.bind(this);

        if (options.initialIndicator) {
            this.indicator = { ...options.initialIndicator };
        } else if (options.indicatorType) {
            this.indicator = this.getDefaultIndicatorByType(options.indicatorType);
        } else {
            this.indicator = this.getDefaultIndicatorByType(MainChartIndicatorType.MA);
        }

        if (options.isOpen) {
            this.calculatePosition();
            this.render();
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
            '#DDA0DD'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    private getDefaultIndicatorByType(type: MainChartIndicatorType): MainChartIndicatorInfo {
        const defaultColor = this.options.theme?.chart?.lineColor || '#2962FF';
        const i18n = this.options.i18n;

        switch (type) {
            case MainChartIndicatorType.VWAP:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.VWAP,
                    params: [{
                        paramName: i18n.indicators?.vwap || 'VWAP',
                        paramValue: 0,
                        lineColor: defaultColor,
                        lineWidth: 1
                    }],
                    nonce: Date.now()
                };
            case MainChartIndicatorType.ENVELOPE:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.ENVELOPE,
                    params: [
                        {
                            paramName: i18n.modal?.parameterName || '周期',
                            paramValue: 20,
                            lineColor: defaultColor,
                            lineWidth: 1
                        },
                        {
                            paramName: i18n.indicators?.envelope || '偏移百分比',
                            paramValue: 2.5,
                            lineColor: this.getRandomColor(),
                            lineWidth: 1
                        }
                    ],
                    nonce: Date.now()
                };
            case MainChartIndicatorType.DONCHIAN:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.DONCHIAN,
                    params: [
                        {
                            paramName: i18n.modal?.parameterName || '周期',
                            paramValue: 20,
                            lineColor: defaultColor,
                            lineWidth: 1
                        },
                        {
                            paramName: i18n.indicators?.donchian || '上轨周期',
                            paramValue: 20,
                            lineColor: this.getRandomColor(),
                            lineWidth: 1
                        },
                        {
                            paramName: i18n.indicators?.donchian || '下轨周期',
                            paramValue: 20,
                            lineColor: this.getRandomColor(),
                            lineWidth: 1
                        }
                    ],
                    nonce: Date.now()
                };
            case MainChartIndicatorType.BOLLINGER:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.BOLLINGER,
                    params: [
                        {
                            paramName: i18n.modal?.parameterName || '周期',
                            paramValue: 20,
                            lineColor: defaultColor,
                            lineWidth: 1
                        },
                        {
                            paramName: i18n.indicators?.bollinger || '上轨标准差',
                            paramValue: 2,
                            lineColor: this.getRandomColor(),
                            lineWidth: 1
                        },
                        {
                            paramName: i18n.indicators?.bollinger || '下轨标准差',
                            paramValue: 2,
                            lineColor: this.getRandomColor(),
                            lineWidth: 1
                        }
                    ],
                    nonce: Date.now()
                };
            case MainChartIndicatorType.EMA:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.EMA,
                    params: [
                        {
                            paramName: `${i18n.indicators?.ema || 'EMA'} 1`,
                            paramValue: 12,
                            lineColor: defaultColor,
                            lineWidth: 1
                        },
                        {
                            paramName: `${i18n.indicators?.ema || 'EMA'} 2`,
                            paramValue: 26,
                            lineColor: this.getRandomColor(),
                            lineWidth: 1
                        }
                    ],
                    nonce: Date.now()
                };
            case MainChartIndicatorType.ICHIMOKU:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.ICHIMOKU,
                    params: [
                        {
                            paramName: i18n.indicators?.ichimoku || '转换线周期',
                            paramValue: 9,
                            lineColor: defaultColor,
                            lineWidth: 1
                        },
                        {
                            paramName: i18n.indicators?.ichimoku || '基准线周期',
                            paramValue: 26,
                            lineColor: this.getRandomColor(),
                            lineWidth: 1
                        },
                        {
                            paramName: i18n.indicators?.ichimoku || '先行跨度周期',
                            paramValue: 52,
                            lineColor: this.getRandomColor(),
                            lineWidth: 1
                        },
                        {
                            paramName: i18n.indicators?.ichimoku || '滞后跨度周期',
                            paramValue: 26,
                            lineColor: this.getRandomColor(),
                            lineWidth: 1
                        }
                    ],
                    nonce: Date.now()
                };
            case MainChartIndicatorType.MA:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.MA,
                    params: [
                        {
                            paramName: `${i18n.indicators?.ma || 'MA'} 1`,
                            paramValue: 5,
                            lineColor: defaultColor,
                            lineWidth: 1
                        },
                        {
                            paramName: `${i18n.indicators?.ma || 'MA'} 2`,
                            paramValue: 10,
                            lineColor: this.getRandomColor(),
                            lineWidth: 1
                        },
                        {
                            paramName: `${i18n.indicators?.ma || 'MA'} 3`,
                            paramValue: 20,
                            lineColor: this.getRandomColor(),
                            lineWidth: 1
                        }
                    ],
                    nonce: Date.now()
                };
            case MainChartIndicatorType.HEATMAP:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.HEATMAP,
                    params: [{
                        paramName: i18n.modal?.parameterName || '周期',
                        paramValue: 20,
                        lineColor: defaultColor,
                        lineWidth: 1
                    }],
                    nonce: Date.now()
                };
            case MainChartIndicatorType.MARKETPROFILE:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.MARKETPROFILE,
                    params: [{
                        paramName: i18n.modal?.parameterName || '周期',
                        paramValue: 20,
                        lineColor: defaultColor,
                        lineWidth: 1
                    }],
                    nonce: Date.now()
                };
            default:
                return {
                    id: Date.now().toString(),
                    type: MainChartIndicatorType.MA,
                    params: [{
                        paramName: `${i18n.modal?.parameterName || '参数'} 1`,
                        paramValue: 0,
                        lineColor: defaultColor,
                        lineWidth: 1
                    }],
                    nonce: Date.now()
                };
        }
    }

    private canModifyItems(): boolean {
        const type = this.options.indicatorType;
        return type === MainChartIndicatorType.MA || type === MainChartIndicatorType.EMA;
    }

    private addIndicatorParam = (): void => {
        if (!this.canModifyItems() || !this.indicator) return;
        const randomColor = this.getRandomColor();
        const paramCount = this.indicator.params?.length || 0;
        let paramName = '';
        const type = this.options.indicatorType;
        const i18n = this.options.i18n;

        if (type === MainChartIndicatorType.MA) {
            paramName = `${i18n.indicators?.ma || 'MA'} ${paramCount + 1}`;
        } else if (type === MainChartIndicatorType.EMA) {
            paramName = `${i18n.indicators?.ema || 'EMA'} ${paramCount + 1}`;
        } else {
            paramName = this.getIndicatorItemLabel(paramCount);
        }

        const newParam: MainChartIndicatorParam = {
            paramName: paramName,
            paramValue: 0,
            lineColor: randomColor,
            lineWidth: 1
        };
        this.indicator = {
            ...this.indicator,
            params: [...(this.indicator.params || []), newParam]
        };
        this.renderParamsList();
    };

    private removeIndicatorParam = (paramIndex: number): void => {
        if (!this.canModifyItems() || !this.indicator || !this.indicator.params) return;
        if (this.indicator.params.length > 1) {
            const newParams = [...this.indicator.params];
            newParams.splice(paramIndex, 1);
            const type = this.options.indicatorType;
            const i18n = this.options.i18n;

            const updatedParams = newParams.map((param, index) => {
                let newParamName = '';
                if (type === MainChartIndicatorType.MA) {
                    newParamName = `${i18n.indicators?.ma || 'MA'} ${index + 1}`;
                } else if (type === MainChartIndicatorType.EMA) {
                    newParamName = `${i18n.indicators?.ema || 'EMA'} ${index + 1}`;
                }
                return {
                    ...param,
                    paramName: newParamName || param.paramName
                };
            });
            this.indicator = {
                ...this.indicator,
                params: updatedParams
            };
            this.renderParamsList();
        }
    };

    private updateIndicatorValue = (paramIndex: number, value: number): void => {
        if (!this.indicator || !this.indicator.params) return;
        const newParams = [...this.indicator.params];
        newParams[paramIndex] = { ...newParams[paramIndex], paramValue: value };
        this.indicator = { ...this.indicator, params: newParams };
    };

    private updateIndicatorColor = (paramIndex: number, color: string): void => {
        if (!this.indicator || !this.indicator.params) return;
        const newParams = [...this.indicator.params];
        newParams[paramIndex] = { ...newParams[paramIndex], lineColor: color };
        this.indicator = { ...this.indicator, params: newParams };
    };

    private updateIndicatorLineWidth = (paramIndex: number, lineWidth: number): void => {
        if (!this.indicator || !this.indicator.params) return;
        const newParams = [...this.indicator.params];
        newParams[paramIndex] = { ...newParams[paramIndex], lineWidth };
        this.indicator = { ...this.indicator, params: newParams };
    };

    private shouldShowNumberInput(): boolean {
        const type = this.options.indicatorType;
        return type !== MainChartIndicatorType.VWAP;
    }

    private handleConfirm = (): void => {
        if (this.indicator) {
            if (this.indicator.params && this.options.indicatorType !== MainChartIndicatorType.VWAP) {
                this.indicator.params = this.indicator.params.filter((param: MainChartIndicatorParam) => param.paramValue !== 0);
            }
            this.options.onConfirm(this.indicator);
        }
    };

    private handleCancel = (): void => {
        if (this.options.initialIndicator) {
            this.indicator = { ...this.options.initialIndicator };
        } else if (this.options.indicatorType) {
            this.indicator = this.getDefaultIndicatorByType(this.options.indicatorType);
        } else {
            this.indicator = this.getDefaultIndicatorByType(MainChartIndicatorType.MA);
        }
        this.options.onClose();
    };

    private getIndicatorTypeName(): string {
        const type = this.options.indicatorType;
        const i18n = this.options.i18n;

        switch (type) {
            case MainChartIndicatorType.MA:
                return `${i18n.indicators?.ma || '移动平均线'} (MA)`;
            case MainChartIndicatorType.EMA:
                return `${i18n.indicators?.ema || '指数移动平均线'} (EMA)`;
            case MainChartIndicatorType.BOLLINGER:
                return `${i18n.indicators?.bollinger || '布林通道'} (BOLL)`;
            case MainChartIndicatorType.ICHIMOKU:
                return `${i18n.indicators?.ichimoku || '一目均衡表'} (ICHIMOKU)`;
            case MainChartIndicatorType.DONCHIAN:
                return `${i18n.indicators?.donchian || '唐奇安通道'} (DONCHIAN)`;
            case MainChartIndicatorType.ENVELOPE:
                return `${i18n.indicators?.envelope || '包络线'} (ENVELOPE)`;
            case MainChartIndicatorType.VWAP:
                return `${i18n.indicators?.vwap || '成交量加权平均价'} (VWAP)`;
            case MainChartIndicatorType.HEATMAP:
                return `${i18n.mainChartMaps?.heatmap || '成交量热力图'} (HEATMAP)`;
            case MainChartIndicatorType.MARKETPROFILE:
                return `${i18n.mainChartMaps?.marketProfile || '市场轮廓'} (Market Profile)`;
            default:
                return i18n.mainChartIndicators || '主图指标设置';
        }
    }

    private getIndicatorItemLabel(index: number): string {
        const type = this.options.indicatorType;
        const i18n = this.options.i18n;

        if (type === MainChartIndicatorType.BOLLINGER) {
            const labels = [
                i18n.modal?.parameterName || '周期',
                i18n.indicators?.bollinger || '上轨标准差',
                i18n.indicators?.bollinger || '下轨标准差'
            ];
            return labels[index] || `${i18n.modal?.parameterName || '参数'} ${index + 1}`;
        }
        if (type === MainChartIndicatorType.ICHIMOKU) {
            const labels = [
                i18n.indicators?.ichimoku || '转换线周期',
                i18n.indicators?.ichimoku || '基准线周期',
                i18n.indicators?.ichimoku || '先行跨度周期',
                i18n.indicators?.ichimoku || '滞后跨度周期'
            ];
            return labels[index] || `${i18n.modal?.parameterName || '参数'} ${index + 1}`;
        }
        if (type === MainChartIndicatorType.DONCHIAN) {
            const labels = [
                i18n.modal?.parameterName || '周期',
                i18n.indicators?.donchian || '上轨周期',
                i18n.indicators?.donchian || '下轨周期'
            ];
            return labels[index] || `${i18n.modal?.parameterName || '参数'} ${index + 1}`;
        }
        if (type === MainChartIndicatorType.ENVELOPE) {
            const labels = [
                i18n.modal?.parameterName || '周期',
                i18n.indicators?.envelope || '偏移百分比'
            ];
            return labels[index] || `${i18n.modal?.parameterName || '参数'} ${index + 1}`;
        }
        if (type === MainChartIndicatorType.VWAP) {
            return i18n.indicators?.vwap || '锚定时间';
        }
        if (type === MainChartIndicatorType.HEATMAP) {
            return i18n.modal?.parameterName || '周期';
        }
        if (type === MainChartIndicatorType.MARKETPROFILE) {
            return i18n.modal?.parameterName || '周期';
        }
        if (type === MainChartIndicatorType.EMA || type === MainChartIndicatorType.MA) {
            return `${i18n.modal?.parameterName || '周期'} ${index + 1}`;
        }
        return `${i18n.modal?.parameterName || '参数'} ${index + 1}`;
    }

    private calculatePosition(): void {
        const parentEl = this.options.parentRef;
        if (parentEl) {
            const parentRect = parentEl.getBoundingClientRect();
            this.modalPosition = {
                x: parentRect.left + (parentRect.width - 400) / 2,
                y: parentRect.top + (parentRect.height - 400) / 2
            };
        } else {
            this.modalPosition = {
                x: Math.max(10, (window.innerWidth - 400) / 2),
                y: Math.max(10, (window.innerHeight - 400) / 2)
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
            const maxX = window.innerWidth - 400;
            const maxY = window.innerHeight - 400;
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
        if (!this.paramsListRef || !this.indicator) return;
        this.paramsListRef.innerHTML = '';
        const styles = this.getStyles();
        this.indicator.params?.forEach((param: MainChartIndicatorParam, paramIndex: number) => {
            const item = this.createElement('div', 'indicator-item', styles.indicatorItem);
            const label = this.createElement('div', 'item-label', styles.itemLabel);
            label.textContent = param.paramName;
            item.appendChild(label);
            if (this.shouldShowNumberInput()) {
                const numberInput = this.createElement('input', 'number-input', styles.numberInput);
                numberInput.type = 'number';
                numberInput.value = param.paramValue.toString();
                numberInput.addEventListener('change', (e) => {
                    this.updateIndicatorValue(paramIndex, Number((e.target as HTMLInputElement).value));
                });
                item.appendChild(numberInput);
            }
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
            const colorDisplay = this.createElement('div', 'color-display', { ...styles.colorDisplay, backgroundColor: param.lineColor });
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

            if (this.canModifyItems() && this.indicator?.params) {
                const deleteBtn = this.createElement('button', 'delete-btn',
                    this.indicator.params.length <= 1 ? styles.deleteButtonDisabled : styles.deleteButton
                );
                deleteBtn.textContent = '×';
                deleteBtn.disabled = this.indicator.params.length <= 1;
                deleteBtn.title = this.indicator.params.length <= 1 ?
                    (this.options.i18n.modal?.keepAtLeastOne || "至少保留一个参数") :
                    (this.options.i18n.modal?.deleteParameter || "删除此参数");
                deleteBtn.addEventListener('click', () => this.removeIndicatorParam(paramIndex));
                item.appendChild(deleteBtn);
            }

            this.paramsListRef!.appendChild(item);
        });
    }

    private getStyles(): { [key: string]: Partial<CSSStyleDeclaration> } {
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
                position: 'absolute',
                left: `${this.modalPosition.x}px`,
                top: `${this.modalPosition.y}px`,
                background: theme?.toolbar?.background || '#fafafa',
                border: `1px solid ${theme?.toolbar?.border || '#d9d9d9'}`,
                borderRadius: '8px',
                padding: '0',
                width: '400px',
                maxWidth: '90vw',
                height: '400px',
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
            itemLabel: {
                fontSize: '12px',
                color: theme?.layout?.textColor || '#000000',
                minWidth: '80px',
                fontWeight: 'bold',
            },
            numberInput: {
                width: '60px',
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

    private applyStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
        Object.assign(element.style, styles);
    }

    private createElement<K extends keyof HTMLElementTagNameMap>(
        tag: K,
        className?: string,
        styles?: Partial<CSSStyleDeclaration>
    ): HTMLElementTagNameMap[K] {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (styles) this.applyStyles(element, styles);
        return element;
    }

    private injectScrollbarStyles(): void {
        const styleId = 'main-chart-indicators-modal-styles';
        if (document.getElementById(styleId)) return;

        const theme = this.options.theme;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .indicators-scrollbar::-webkit-scrollbar {
                width: 6px;
            }
            .indicators-scrollbar::-webkit-scrollbar-track {
                background: ${theme?.toolbar?.background || '#fafafa'};
                border-radius: 3px;
            }
            .indicators-scrollbar::-webkit-scrollbar-thumb {
                background: ${theme?.toolbar?.border || '#d9d9d9'};
                border-radius: 3px;
            }
            .indicators-scrollbar::-webkit-scrollbar-thumb:hover {
                background: ${theme?.layout?.textColor || '#000000'}80;
            }
        `;
        document.head.appendChild(style);
    }

    private render(): void {
        if (this.container) {
            this.destroy();
        }

        if (!this.indicator) return;

        this.injectScrollbarStyles();
        this.container = this.createElement('div', 'main-chart-indicators-modal-overlay');
        const styles = this.getStyles();
        this.applyStyles(this.container, styles.modalOverlay);

        this.modalRef = this.createElement('div', 'main-chart-indicators-modal-content', styles.modalContent);
        this.modalRef.addEventListener('mousedown', this.handleMouseDown as EventListener);
        this.modalRef.addEventListener('keydown', this.handleKeyPress as EventListener);

        this.headerRef = this.createElement('div', 'main-chart-indicators-modal-header', styles.modalHeader);
        const title = this.createElement('div', 'main-chart-indicators-modal-title', styles.modalTitle);
        title.textContent = this.getIndicatorTypeName();
        this.headerRef.appendChild(title);
        this.modalRef.appendChild(this.headerRef);

        const body = this.createElement('div', 'main-chart-indicators-modal-body', styles.modalBody);

        this.paramsListRef = this.createElement('div', 'indicators-scrollbar', styles.indicatorsList);
        this.renderParamsList();
        body.appendChild(this.paramsListRef);

        if (this.canModifyItems()) {
            const addBtn = this.createElement('button', 'add-btn', styles.addButton);
            addBtn.textContent = `+ ${this.options.i18n.modal?.addParameter || "添加参数"}`;
            addBtn.addEventListener('click', this.addIndicatorParam);
            body.appendChild(addBtn);
        }

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

    public update(options: Partial<MainChartIndicatorsSettingModalOptions>): void {
        if (options.initialIndicator !== undefined) {
            this.indicator = options.initialIndicator ? { ...options.initialIndicator } : null;
        }
        if (options.indicatorType !== undefined && !this.indicator && options.indicatorType !== null) {
            this.indicator = this.getDefaultIndicatorByType(options.indicatorType);
        }
        Object.assign(this.options, options);

        if (options.isOpen !== undefined) {
            if (options.isOpen) {
                this.calculatePosition();
                this.render();
            } else {
                this.destroy();
            }
        } else if (this.options.isOpen && this.indicator) {
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