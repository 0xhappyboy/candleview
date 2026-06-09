import { MainChartIndicatorInfo } from '../Indicators/mainchart/MainChartIndicatorInfo';
import { IIndicatorInfo } from '../Indicators/subchart/IIndicator';
import { SubChartIndicatorType } from '../types';
import { ThemeConfig } from '../theme';
import { I18n } from '../i18n';
import { MainChartIndicatorsSettingModal } from '../components/modal/MainChartIndicatorsSettingModal';
import { SubChartIndicatorsSettingModal } from '../components/modal/SubChartIndicatorsSettingModal';
import { TextMarkEditorModal } from '../components/modal/TextMarkEditorModal';
import { ImageUploadModal } from '../components/modal/ImageUploadModal';
import { Chart } from './Chart';

export class ChartModalsManager {
    private chart: Chart;
    private container: HTMLElement;
    private currentTheme: ThemeConfig;
    private i18n: I18n;
    public imageUploadModal: ImageUploadModal | null = null;
    public mainChartIndicatorsModal: MainChartIndicatorsSettingModal | null = null;
    public subChartIndicatorsModal: SubChartIndicatorsSettingModal | null = null;
    public textMarkEditorModal: TextMarkEditorModal | null = null;
    public isImageUploadModalOpen: boolean = false;
    public isMainChartIndicatorsModalOpen: boolean = false;
    public isSubChartIndicatorsModalOpen: boolean = false;
    public isTextMarkEditorModalOpen: boolean = false;
    public onImageConfirmCallback?: (imageUrl: string) => void;
    public onMainChartIndicatorConfirmCallback?: (indicator: MainChartIndicatorInfo) => void;
    public onSubChartIndicatorConfirmCallback?: (params: IIndicatorInfo[]) => void;
    public onTextMarkEditorSaveCallback?: (text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => void;
    public onTextMarkEditorCancelCallback?: () => void;
    public editingIndicator: MainChartIndicatorInfo | null = null;
    public editingSubChartParams: IIndicatorInfo[] = [];
    public currentSubChartType: SubChartIndicatorType | null = null;
    public pendingImageUrl: string = '';
    public textMarkEditorPosition: { x: number; y: number } = { x: 0, y: 0 };
    public textMarkEditorData: {
        text: string;
        color: string;
        fontSize: number;
        isBold: boolean;
        isItalic: boolean;
    } = { text: '', color: '#000000', fontSize: 14, isBold: false, isItalic: false };
    constructor(chart: Chart, container: HTMLElement, currentTheme: ThemeConfig, i18n: I18n) {
        this.chart = chart;
        this.container = container;
        this.currentTheme = currentTheme;
        this.i18n = i18n;
    }

    public setCallbacks(callbacks: {
        onImageConfirm?: (imageUrl: string) => void;
        onMainChartIndicatorConfirm?: (indicator: MainChartIndicatorInfo) => void;
        onSubChartIndicatorConfirm?: (params: IIndicatorInfo[]) => void;
        onTextMarkEditorSave?: (text: string, color: string, fontSize: number, isBold: boolean, isItalic: boolean) => void;
        onTextMarkEditorCancel?: () => void;
    }): void {
        this.onImageConfirmCallback = callbacks.onImageConfirm;
        this.onMainChartIndicatorConfirmCallback = callbacks.onMainChartIndicatorConfirm;
        this.onSubChartIndicatorConfirmCallback = callbacks.onSubChartIndicatorConfirm;
        this.onTextMarkEditorSaveCallback = callbacks.onTextMarkEditorSave;
        this.onTextMarkEditorCancelCallback = callbacks.onTextMarkEditorCancel;
    }

    public openImageUploadModal(): void {
        this.isImageUploadModalOpen = true;
        this.updateImageUploadModal();
    }

    public closeImageUploadModal(): void {
        this.isImageUploadModalOpen = false;
        this.updateImageUploadModal();
    }

    private updateImageUploadModal(): void {
        if (this.isImageUploadModalOpen) {
            if (!this.imageUploadModal) {
                this.imageUploadModal = new ImageUploadModal({
                    isOpen: true,
                    onClose: () => this.closeImageUploadModal(),
                    onConfirm: (imageUrl: string) => {
                        this.pendingImageUrl = imageUrl;
                        this.onImageConfirmCallback?.(imageUrl);
                        this.closeImageUploadModal();
                    },
                    theme: this.currentTheme,
                    i18n: this.i18n,
                    parentRef: this.container
                });
            } else {
                this.imageUploadModal.update({
                    isOpen: true,
                    theme: this.currentTheme,
                    i18n: this.i18n,
                    parentRef: this.container
                });
            }
        } else {
            this.imageUploadModal?.destroy();
            this.imageUploadModal = null;
        }
    }

    public openMainChartIndicatorsModal(indicator?: MainChartIndicatorInfo | null): void {
        this.isMainChartIndicatorsModalOpen = true;
        this.editingIndicator = indicator || null;
        this.updateMainChartIndicatorsModal();
    }

    public closeMainChartIndicatorsModal(): void {
        this.isMainChartIndicatorsModalOpen = false;
        this.editingIndicator = null;
        this.updateMainChartIndicatorsModal();
    }

    private updateMainChartIndicatorsModal(): void {
        if (this.isMainChartIndicatorsModalOpen) {
            if (!this.mainChartIndicatorsModal) {
                this.mainChartIndicatorsModal = new MainChartIndicatorsSettingModal({
                    isOpen: true,
                    onClose: () => this.closeMainChartIndicatorsModal(),
                    onConfirm: (indicator: MainChartIndicatorInfo) => {
                        this.onMainChartIndicatorConfirmCallback?.(indicator);
                        this.closeMainChartIndicatorsModal();
                    },
                    initialIndicator: this.editingIndicator,
                    theme: this.currentTheme,
                    parentRef: this.container,
                    indicatorType: this.editingIndicator?.type || null,
                    i18n: this.i18n
                });
            } else {
                this.mainChartIndicatorsModal.update({
                    isOpen: true,
                    initialIndicator: this.editingIndicator,
                    theme: this.currentTheme,
                    parentRef: this.container,
                    indicatorType: this.editingIndicator?.type || null,
                    i18n: this.i18n
                });
            }
        } else {
            this.mainChartIndicatorsModal?.destroy();
            this.mainChartIndicatorsModal = null;
        }
    }

    public openSubChartIndicatorsModal(params: IIndicatorInfo[], indicatorType: SubChartIndicatorType): void {
        this.isSubChartIndicatorsModalOpen = true;
        this.editingSubChartParams = [...params];
        this.currentSubChartType = indicatorType;
        this.updateSubChartIndicatorsModal();
    }

    public closeSubChartIndicatorsModal(): void {
        this.isSubChartIndicatorsModalOpen = false;
        this.editingSubChartParams = [];
        this.currentSubChartType = null;
        this.updateSubChartIndicatorsModal();
    }

    private updateSubChartIndicatorsModal(): void {
        if (this.isSubChartIndicatorsModalOpen) {
            if (!this.subChartIndicatorsModal) {
                this.subChartIndicatorsModal = new SubChartIndicatorsSettingModal({
                    isOpen: true,
                    onClose: () => this.closeSubChartIndicatorsModal(),
                    onConfirm: (params: IIndicatorInfo[]) => {
                        this.onSubChartIndicatorConfirmCallback?.(params);
                        this.closeSubChartIndicatorsModal();
                    },
                    initialParams: this.editingSubChartParams,
                    theme: this.currentTheme,
                    parentRef: this.container,
                    indicatorType: this.currentSubChartType,
                    i18n: this.i18n
                });
            } else {
                this.subChartIndicatorsModal.update({
                    isOpen: true,
                    initialParams: this.editingSubChartParams,
                    theme: this.currentTheme,
                    parentRef: this.container,
                    indicatorType: this.currentSubChartType,
                    i18n: this.i18n
                });
            }
        } else {
            this.subChartIndicatorsModal?.destroy();
            this.subChartIndicatorsModal = null;
        }
    }

    public openTextMarkEditorModal(
        position: { x: number; y: number },
        text: string,
        color: string,
        fontSize: number,
        isBold: boolean,
        isItalic: boolean
    ): void {
        this.isTextMarkEditorModalOpen = true;
        this.textMarkEditorPosition = { ...position };
        this.textMarkEditorData = { text, color, fontSize, isBold, isItalic };
        this.updateTextMarkEditorModal();
    }

    public closeTextMarkEditorModal(): void {
        this.isTextMarkEditorModalOpen = false;
        this.updateTextMarkEditorModal();
    }

    private updateTextMarkEditorModal(): void {
        if (this.isTextMarkEditorModalOpen) {
            if (!this.textMarkEditorModal) {
                this.textMarkEditorModal = new TextMarkEditorModal({
                    isOpen: true,
                    position: this.textMarkEditorPosition,
                    theme: this.currentTheme,
                    parentRef: this.container,
                    initialText: this.textMarkEditorData.text,
                    initialColor: this.textMarkEditorData.color,
                    initialFontSize: this.textMarkEditorData.fontSize,
                    initialIsBold: this.textMarkEditorData.isBold,
                    initialIsItalic: this.textMarkEditorData.isItalic,
                    onSave: (text, color, fontSize, isBold, isItalic) => {
                        this.onTextMarkEditorSaveCallback?.(text, color, fontSize, isBold, isItalic);
                        this.closeTextMarkEditorModal();
                    },
                    onCancel: () => {
                        this.onTextMarkEditorCancelCallback?.();
                        this.closeTextMarkEditorModal();
                    },
                    i18n: this.i18n
                });
            } else {
                this.textMarkEditorModal.update({
                    isOpen: true,
                    position: this.textMarkEditorPosition,
                    theme: this.currentTheme,
                    parentRef: this.container,
                    initialText: this.textMarkEditorData.text,
                    initialColor: this.textMarkEditorData.color,
                    initialFontSize: this.textMarkEditorData.fontSize,
                    initialIsBold: this.textMarkEditorData.isBold,
                    initialIsItalic: this.textMarkEditorData.isItalic,
                    i18n: this.i18n
                });
            }
        } else {
            this.textMarkEditorModal?.destroy();
            this.textMarkEditorModal = null;
        }
    }

    public updateTheme(theme: ThemeConfig): void {
        this.currentTheme = theme;
        this.imageUploadModal?.update({ theme, i18n: this.i18n });
        this.mainChartIndicatorsModal?.update({ theme, i18n: this.i18n });
        this.subChartIndicatorsModal?.update({ theme, i18n: this.i18n });
        this.textMarkEditorModal?.update({ theme, i18n: this.i18n });
    }

    public updateI18n(i18n: I18n): void {
        this.i18n = i18n;
        this.imageUploadModal?.update({ i18n });
        this.mainChartIndicatorsModal?.update({ i18n });
        this.subChartIndicatorsModal?.update({ i18n });
        this.textMarkEditorModal?.update({ i18n });
    }

    public destroy(): void {
        this.imageUploadModal?.destroy();
        this.mainChartIndicatorsModal?.destroy();
        this.subChartIndicatorsModal?.destroy();
        this.textMarkEditorModal?.destroy();
        this.imageUploadModal = null;
        this.mainChartIndicatorsModal = null;
        this.subChartIndicatorsModal = null;
        this.textMarkEditorModal = null;
    }
}