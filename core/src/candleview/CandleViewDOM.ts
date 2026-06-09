export class CandleViewDOM {
    public rootEl: HTMLElement | null = null;
    public chartContainerEl: HTMLElement | null = null;
    public topPanelContainer: HTMLElement | null = null;
    public leftPanelContainer: HTMLElement | null = null;

    constructor() { }

    public create(container: HTMLElement, themeColors: any): void {
        container.innerHTML = '';
        container.style.cssText = 'position:relative;width:100%;height:100%;overflow:hidden;';
        const style = document.createElement('style');
        style.id = 'candleview-no-select';
        style.textContent = `
            .candleview-root,
            .candleview-root * {
                user-select: none !important;
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
            }
            .candleview-root input,
            .candleview-root textarea {
                user-select: text !important;
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
            }
        `;
        const oldStyle = document.getElementById('candleview-no-select');
        if (oldStyle) oldStyle.remove();
        document.head.appendChild(style);
        this.rootEl = document.createElement('div');
        this.rootEl.className = 'candleview-root';
        this.rootEl.style.cssText = `
            position:absolute;top:0;left:0;right:0;bottom:0;
            display:flex;flex-direction:column;
            background:${themeColors.background};
            overflow:hidden;
        `;
        this.rootEl.addEventListener('contextmenu', (e) => { e.preventDefault(); });
        this.topPanelContainer = document.createElement('div');
        this.topPanelContainer.className = 'candleview-top-panel-container';
        this.topPanelContainer.style.cssText = 'flex-shrink:0;position:relative;';
        const mainContent = document.createElement('div');
        mainContent.style.cssText = 'display:flex;flex:1;min-height:0;overflow:hidden;';
        this.leftPanelContainer = document.createElement('div');
        this.leftPanelContainer.className = 'candleview-left-panel-container';
        this.leftPanelContainer.style.cssText = 'flex-shrink:0;';
        this.chartContainerEl = document.createElement('div');
        this.chartContainerEl.className = 'candleview-chart-container';
        this.chartContainerEl.style.cssText = 'flex:1;min-width:0;min-height:0;position:relative;';
        mainContent.appendChild(this.leftPanelContainer);
        mainContent.appendChild(this.chartContainerEl);
        this.rootEl.appendChild(this.topPanelContainer);
        this.rootEl.appendChild(mainContent);
        container.appendChild(this.rootEl);
    }
    public getRootEl(): HTMLElement | null { return this.rootEl; }
    public getChartContainerEl(): HTMLElement | null { return this.chartContainerEl; }
    public getTopPanelContainer(): HTMLElement | null { return this.topPanelContainer; }
    public getLeftPanelContainer(): HTMLElement | null { return this.leftPanelContainer; }
    public destroy(): void {
        const style = document.getElementById('candleview-no-select');
        if (style) style.remove();
        this.rootEl?.remove();
        this.rootEl = null;
        this.chartContainerEl = null;
        this.topPanelContainer = null;
        this.leftPanelContainer = null;
    }
}