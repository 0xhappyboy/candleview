import { CoreState } from './types';

export class CandleViewDOM {
    private state: CoreState;
    public rootEl: HTMLElement | null = null;
    public chartContainerEl: HTMLElement | null = null;

    constructor(state: CoreState) {
        this.state = state;
    }

    public create(): void {
        const container = this.state.container;
        const colors = this.state.theme.getColors();
        container.innerHTML = '';
        container.style.cssText = `position:relative;width:100%;height:100%;margin:0;padding:0;overflow:hidden;box-sizing:border-box;`;
        this.rootEl = document.createElement('div');
        this.rootEl.className = 'candleview-root';
        this.rootEl.style.cssText = `position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex;flex-direction:column;background:${colors.background};font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;user-select:none;overflow:hidden;margin:0;padding:0;box-sizing:border-box;`;
        const topPanelContainer = document.createElement('div');
        topPanelContainer.className = 'candleview-top-panel-container';
        topPanelContainer.style.cssText = `flex-shrink:0;`;
        this.rootEl.appendChild(topPanelContainer);
        const mainContent = document.createElement('div');
        mainContent.className = 'candleview-main-content';
        mainContent.style.cssText = `display:flex;flex:1;min-height:0;overflow:hidden;position:relative;`;
        const leftPanelContainer = document.createElement('div');
        leftPanelContainer.className = 'candleview-left-panel-container';
        leftPanelContainer.style.cssText = `flex-shrink:0;`;
        mainContent.appendChild(leftPanelContainer);
        this.chartContainerEl = document.createElement('div');
        this.chartContainerEl.className = 'candleview-chart-container';
        this.chartContainerEl.style.cssText = `flex:1;min-width:0;min-height:0;position:relative;overflow:hidden;`;
        mainContent.appendChild(this.chartContainerEl);
        this.rootEl.appendChild(mainContent);
        container.appendChild(this.rootEl);
        (this.state as any).topPanelContainer = topPanelContainer;
        (this.state as any).leftPanelContainer = leftPanelContainer;
        this.state.rootEl = this.rootEl;
        this.state.chartContainerEl = this.chartContainerEl;
    }

    public getRootEl(): HTMLElement | null { return this.rootEl; }
    public getChartContainerEl(): HTMLElement | null { return this.chartContainerEl; }
    public getTopPanelContainer(): HTMLElement | null { return this.rootEl?.querySelector('.candleview-top-panel-container') as HTMLElement || null; }
    public getLeftPanelContainer(): HTMLElement | null { return this.rootEl?.querySelector('.candleview-left-panel-container') as HTMLElement || null; }

    public destroy(): void {
        this.rootEl?.remove();
        this.rootEl = null;
        this.chartContainerEl = null;
        this.state.rootEl = null;
        this.state.chartContainerEl = null;
    }
}