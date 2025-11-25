import { MouseEventParams, Point } from "lightweight-charts";
import { ThemeConfig } from "../../Theme";
import { SubChartIndicatorType } from "../../types";
import { IChartPane } from "./IChartPanes";
import { IIndicatorInfo } from "../../Indicators/SubChart/IIndicator";

export abstract class BaseChartPane implements IChartPane {

    protected _infoElement: HTMLElement | null = null;

    constructor(
        public readonly id: string,
        public readonly size: number,
        public readonly vertPosition: 'left' | 'right',
        public readonly indicatorType: SubChartIndicatorType,
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
        if (!this.paneInstance) return;
        const chartElement = this.paneInstance.getHTMLElement();
        if (!chartElement) return;
        this._infoElement = document.createElement('div');
        this._infoElement.className = 'chart-pane-info';
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
        const nameElement = document.createElement('span');
        nameElement.textContent = this.indicatorType;
        nameElement.style.cssText = `
        color: ${this.theme.layout.textColor};
        font-size: 11px;
        font-weight: bold;
        background: transparent;
        padding: 2px 0px;
        border-radius: 0px;
        opacity: 0.9;
        pointer-events: none;
    `;
        const settingsButton = document.createElement('button');
        settingsButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    `;
        settingsButton.style.cssText = `
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${this.theme.layout.textColor};
        opacity: 0.7;
        transition: all 0.2s;
        width: 20px;
        height: 20px;
        pointer-events: auto;
    `;
        settingsButton.title = 'Settings';
        settingsButton.addEventListener('click', () => { this.onSettingsClick(this.indicatorType) });
        settingsButton.addEventListener('mouseenter', (e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = this.theme.toolbar.button.hover;
            target.style.opacity = '1';
        });
        settingsButton.addEventListener('mouseleave', (e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = 'transparent';
            target.style.opacity = '0.7';
        });
        const closeButton = document.createElement('button');
        closeButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    `;
        closeButton.style.cssText = `
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0px;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${this.theme.layout.textColor};
        opacity: 0.7;
        transition: all 0.2s;
        width: 20px;
        height: 20px;
        pointer-events: auto;
        margin-left: -6px;
    `;
        closeButton.title = 'Close';
        closeButton.addEventListener('click', () => { this.onCloseClick(this.indicatorType) });
        closeButton.addEventListener('mouseenter', (e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = this.theme.toolbar.button.hover;
            target.style.opacity = '1';
        });
        closeButton.addEventListener('mouseleave', (e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = 'transparent';
            target.style.opacity = '0.7';
        });
        const paramsContainer = document.createElement('div');
        paramsContainer.className = 'params-container';
        paramsContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 5px;
        margin-left: 0px;
        pointer-events: none;
    `;
        this._infoElement.appendChild(nameElement);
        this._infoElement.appendChild(settingsButton);
        this._infoElement.appendChild(closeButton);
        this._infoElement.appendChild(paramsContainer);
        chartElement.style.position = 'relative';
        chartElement.appendChild(this._infoElement);
    }

    destroy(): void {
        if (this._infoElement && this._infoElement.parentNode) {
            this._infoElement.parentNode.removeChild(this._infoElement);
        }
        this._infoElement = null;
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
        this.createInfoElement();
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