import { MouseEventParams, Point } from "lightweight-charts";
import { SubChartIndicatorType } from "../../types";
import { IChartPane } from "./IChartPanes";
import { IIndicatorInfo } from "../../Indicators/subchart/IIndicator";
import { ThemeConfig } from "../../theme";

export abstract class BaseChartPane implements IChartPane {

    protected _infoElement: HTMLElement | null = null;
    private _nameElement: HTMLElement | null = null;
    private _settingsButton: HTMLElement | null = null;
    private _closeButton: HTMLElement | null = null;
    private _paramsContainer: HTMLElement | null = null;

    constructor(
        public readonly id: string,
        public readonly size: number,
        public readonly vertPosition: 'left' | 'right',
        public readonly indicatorType: SubChartIndicatorType,
        public readonly chartInstance: any,
        public readonly paneInstance: any,
        public theme: ThemeConfig,
        public onSettingsClick: (subChartIndicatorType: SubChartIndicatorType) => void,
        public onCloseClick: (subChartIndicatorType: SubChartIndicatorType) => void,
    ) {

    }

    public init(chartData: any[], settings?: {
        paramName: string,
        paramValue: number,
        lineColor: string,
        lineWidth: number
    }[]): void { }

    protected createInfoElement() {
        console.log('[BaseChartPane] createInfoElement for:', this.indicatorType);
        if (!this.paneInstance) return;
        const chartElement = this.paneInstance.getHTMLElement();
        if (!chartElement) return;
        if (this._infoElement && this._infoElement.parentNode) {
            this.updateInfoElementStyles();
            return;
        }
        this._infoElement = document.createElement('div');
        this._infoElement.className = 'chart-pane-info';
        this._nameElement = document.createElement('span');
        this._nameElement.textContent = this.indicatorType;
        this._settingsButton = this.createSettingsButton();
        this._closeButton = this.createCloseButton();
        this._paramsContainer = document.createElement('div');
        this._paramsContainer.className = 'params-container';
        this._paramsContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 5px;
            margin-left: 0px;
            pointer-events: none;
        `;
        this._infoElement.appendChild(this._nameElement);
        this._infoElement.appendChild(this._settingsButton);
        this._infoElement.appendChild(this._closeButton);
        this._infoElement.appendChild(this._paramsContainer);
        chartElement.style.position = 'relative';
        chartElement.appendChild(this._infoElement);
        this.updateInfoElementStyles();
    }

    private updateInfoElementStyles() {
        if (!this._infoElement) return;
        this._infoElement.style.cssText = `
            position: absolute;
            top: 5px;
            left: 10px;
            z-index: 10;
            background: transparent;
            border: none;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 5px;
            pointer-events: none;
        `;
        if (this._nameElement) {
            this._nameElement.style.cssText = `
                color: ${this.theme.layout.textColor};
                font-size: 11px;
                font-weight: bold;
                background: transparent;
                padding: 2px 0px;
                border-radius: 0px;
                opacity: 0.9;
                pointer-events: none;
            `;
        }
        if (this._settingsButton) {
            this._settingsButton.style.color = this.theme.layout.textColor;
        }
        if (this._closeButton) {
            this._closeButton.style.color = this.theme.layout.textColor;
        }
    }

    private createSettingsButton(): HTMLElement {
        const button = document.createElement('button');
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        `;
        button.style.cssText = `
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
            transition: all 0.2s;
            width: 20px;
            height: 20px;
            pointer-events: auto;
        `;
        button.title = 'Settings';
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onSettingsClick(this.indicatorType);
        });
        button.addEventListener('mouseenter', (e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = this.theme.toolbar.button.hover;
            target.style.opacity = '1';
        });
        button.addEventListener('mouseleave', (e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = 'transparent';
            target.style.opacity = '0.7';
        });
        return button;
    }

    private createCloseButton(): HTMLElement {
        const button = document.createElement('button');
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        `;
        button.style.cssText = `
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0px;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
            transition: all 0.2s;
            width: 20px;
            height: 20px;
            pointer-events: auto;
            margin-left: -6px;
        `;
        button.title = 'Close';
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onCloseClick(this.indicatorType);
        });
        button.addEventListener('mouseenter', (e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = this.theme.toolbar.button.hover;
            target.style.opacity = '1';
        });
        button.addEventListener('mouseleave', (e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = 'transparent';
            target.style.opacity = '0.7';
        });
        return button;
    }

    destroy(): void {
        if (this._infoElement && this._infoElement.parentNode) {
            this._infoElement.parentNode.removeChild(this._infoElement);
        }
        this._infoElement = null;
        this._nameElement = null;
        this._settingsButton = null;
        this._closeButton = null;
        this._paramsContainer = null;
    }

    getSeries(): { [key: string]: any } {
        return {};
    }

    getChart(): any {
        return this.paneInstance;
    }

    public getParams(): IIndicatorInfo[] {
        return [];
    }

    updateData(chartData: any[]): void { }

    setStyles(styles: any): void { }

    setVisible(visible: boolean): void { }

    updateThme(theme: ThemeConfig): void {
        this.theme = theme;
        this.updateInfoElementStyles();
    }

    updateSettings(chartData: any[], settings: IIndicatorInfo[]): void { }

    protected getDefaultPriceScaleId(): string {
        return 'right';
    }

    public handleMouseDown(poin: Point): void {
    }

    public handleMouseMove(poin: Point): void {
    }

    public handleMouseUp(poin: Point): void {
    }

    public handleCrosshairMoveEvent(event: MouseEventParams): void {
    }
}