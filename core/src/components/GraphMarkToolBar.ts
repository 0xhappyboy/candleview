import { I18n } from '../i18n';
import { ThemeConfig } from '../theme';
import { DrawingType, MarkDrawing, Point } from '../types';

export interface GraphMarkToolBarOptions {
    position: Point;
    selectedDrawing: MarkDrawing | null;
    theme: ThemeConfig;
    i18n: I18n;
    container: HTMLElement;
    onClose: () => void;
    onDelete: () => void;
    onChangeColor: (color: string) => void;
    onChangeStyle: (lineStyle: 'solid' | 'dashed' | 'dotted') => void;
    onChangeWidth: (width: number) => void;
    onDragStart: (point: Point) => void;
}

export class GraphMarkToolBar {
    public container: HTMLElement | null = null;
    private options: GraphMarkToolBarOptions;
    private activePanel: 'color' | 'lineSize' | 'lineStyle' | null = null;
    private currentColor: string;
    private lineWidth: number = 1;
    private lineStyle: 'solid' | 'dashed' | 'dotted' = 'solid';

    constructor(options: GraphMarkToolBarOptions) {
        this.options = options;
        this.currentColor = options.selectedDrawing?.color || '#000000';
        this.lineWidth = options.selectedDrawing?.lineWidth || 1;
        this.lineStyle = (options.selectedDrawing?.graphStyle as 'solid' | 'dashed' | 'dotted') || 'solid';
        this.init();
    }

    private init(): void {
        this.createDOM();
        this.bindEvents();
    }

    public containsElement(element: Node): boolean {
        return this.container ? this.container.contains(element) : false;
    }

    public getContainer(): HTMLElement | null {
        return this.container;
    }

    private createDOM(): void {
        const { position, theme } = this.options;

        this.container = document.createElement('div');
        this.container.className = 'graph-mark-toolbar';
        this.container.style.cssText = `
            position: absolute;
            left: ${position.x}px;
            top: ${position.y}px;
            z-index: 1000;
            pointer-events: auto;
        `;

        this.container.innerHTML = this.renderMainToolbar();
        document.body.appendChild(this.container);
    }

    private renderMainToolbar(): string {
        const { theme, selectedDrawing } = this.options;
        const { activePanel, currentColor } = this;
        const isImageMark = selectedDrawing?.markType === DrawingType.Image;
        return `
        <div class="graph-toolbar-main" style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: ${theme.toolbar.background};
            color: ${theme.layout.textColor};
            border: 1px solid ${theme.toolbar.border};
            border-radius: 8px;
            padding: 6px 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            cursor: default;
            user-select: none;
            position: relative;
        ">
            ${this.renderDragHandle()}
            ${!isImageMark ? '<div style="width:1px; height:24px; background:' + theme.toolbar.border + '; margin:0 4px;"></div>' : ''}
            ${!isImageMark ? `
                <div style="position:relative;">
                    <button class="graph-toolbar-color-btn" style="
                        background: ${activePanel === 'color' ? theme.toolbar.button.active : theme.toolbar.button.background};
                        color: ${activePanel === 'color' ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color};
                        border: 1px solid ${theme.toolbar.border};
                        border-radius: 4px;
                        padding: 4px;
                        cursor: pointer;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    ">
                        <div style="width:20px; height:20px; background:${currentColor}; border:1px solid ${theme.toolbar.border}; border-radius:2px;"></div>
                    </button>
                </div>
                <div style="position:relative;">
                    <button class="graph-toolbar-size-btn" style="
                        background: ${activePanel === 'lineSize' ? theme.toolbar.button.active : theme.toolbar.button.background};
                        color: ${activePanel === 'lineSize' ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color};
                        border: 1px solid ${theme.toolbar.border};
                        border-radius: 4px;
                        padding: 6px;
                        cursor: pointer;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    ">
                        ━
                    </button>
                </div>
                <div style="position:relative;">
                    <button class="graph-toolbar-style-btn" style="
                        background: ${activePanel === 'lineStyle' ? theme.toolbar.button.active : theme.toolbar.button.background};
                        color: ${activePanel === 'lineStyle' ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color};
                        border: 1px solid ${theme.toolbar.border};
                        border-radius: 4px;
                        padding: 6px;
                        cursor: pointer;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    ">
                        ─·
                    </button>
                </div>
            ` : ''}
            <button class="graph-toolbar-delete-btn" style="
                background: ${theme.toolbar.button.background};
                color: ${theme.toolbar.button.color};
                border: 1px solid ${theme.toolbar.border};
                border-radius: 4px;
                padding: 6px;
                cursor: pointer;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" />
            <path d="M19 6v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6" />
            <path d="M10 11v5" />
            <path d="M14 11v5" />
            </svg>
            </button>
            <button class="graph-toolbar-close-btn" style="
                background: ${theme.toolbar.button.background};
                color: ${theme.toolbar.button.color};
                border: 1px solid ${theme.toolbar.border};
                border-radius: 4px;
                padding: 6px;
                cursor: pointer;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            ">
                ✕
            </button>
        </div>
    `;
    }

    private renderDragHandle(): string {
        const { theme } = this.options;
        let dots = '';
        for (let i = 0; i < 3; i++) {
            dots += `<div style="display:flex; gap:2px;">`;
            for (let j = 0; j < 2; j++) {
                dots += `<div style="width:3px; height:3px; border-radius:50%; background:${theme.layout.textColor}; opacity:0.6;"></div>`;
            }
            dots += `</div>`;
        }
        return `
            <div class="graph-toolbar-drag-handle" style="
                display: flex;
                flex-direction: column;
                gap: 2px;
                padding: 6px 4px;
                cursor: grab;
                user-select: none;
            ">
                ${dots}
            </div>
        `;
    }

    private getColorPanelInnerHTML(): string {
        const { theme, i18n, selectedDrawing } = this.options;
        const colors = [
            '#FF0000', '#FF3333', '#FF6666', '#FF9999', '#FFCCCC',
            '#CC0000', '#CC3333', '#CC6666', '#CC9999', '#CCCCCC',
            '#00FF00', '#33FF33', '#66FF66', '#99FF99', '#CCFFCC',
            '#00CC00', '#33CC33', '#66CC66', '#99CC99', '#CCCCCC',
            '#0000FF', '#3333FF', '#6666FF', '#9999FF', '#CCCCFF',
            '#0000CC', '#3333CC', '#6666CC', '#9999CC', '#CCCCFF',
            '#FFFF00', '#FFFF33', '#FFFF66', '#FFFF99', '#FFFFCC',
            '#FF9900', '#FFAA33', '#FFBB66', '#FFCC99', '#FFDDCC',
            '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
            '#8B4513', '#A0522D', '#CD853F', '#D2691E', '#F4A460'
        ];

        let colorButtons = '';
        colors.forEach(color => {
            colorButtons += `
                <button class="graph-color-option" data-color="${color}" style="
                    width: 20px;
                    height: 20px;
                    background: ${color};
                    border: 1px solid ${color === '#FFFFFF' ? theme.toolbar.border : 'transparent'};
                    border-radius: 3px;
                    cursor: pointer;
                    transition: all 0.1s;
                "></button>
            `;
        });

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <strong style="font-size:14px;">${i18n.toolBar.selectColor}</strong>
                <button class="graph-toolbar-close-panel" style="background:none; border:none; color:inherit; cursor:pointer; font-size:16px;">✕</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(10,1fr); gap:4px; margin-bottom:12px;">
                ${colorButtons}
            </div>
            <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-top:8px; padding:8px; background:${theme.toolbar.button.background}; border-radius:4px;">
                <span style="font-size:12px;">${i18n.toolBar.currentColor}:</span>
                <div style="width:24px; height:24px; background:${selectedDrawing?.color || '#000000'}; border:1px solid ${theme.toolbar.border}; border-radius:3px;"></div>
                <span style="font-size:12px;">${selectedDrawing?.color || '#000000'}</span>
            </div>
        `;
    }

    private getLineSizePanelInnerHTML(): string {
        const { theme, i18n } = this.options;
        const lineSizes = [1, 2, 3, 4];
        let sizeButtons = '';
        lineSizes.forEach(size => {
            sizeButtons += `
                <button class="graph-line-size-option" data-size="${size}" style="
                    padding: 6px 8px;
                    background: ${this.lineWidth === size ? theme.toolbar.button.active : theme.toolbar.button.background};
                    color: ${this.lineWidth === size ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color};
                    border: 1px solid ${theme.toolbar.border};
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                ">
                    <div style="width:24px; height:${size}px; background:${theme.layout.textColor}; border-radius:1px;"></div>
                    <span>${size}px</span>
                </button>
            `;
        });

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong style="font-size:12px;">${i18n.toolBar.lineSize}</strong>
                <button class="graph-toolbar-close-panel" style="background:none; border:none; color:inherit; cursor:pointer; font-size:14px;">✕</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
                ${sizeButtons}
            </div>
        `;
    }

    private getLineStylePanelInnerHTML(): string {
        const { theme, i18n } = this.options;
        const lineStyles = [
            { id: 'solid', name: i18n.toolBar.solid },
            { id: 'dashed', name: i18n.toolBar.dashed },
            { id: 'dotted', name: i18n.toolBar.dotted }
        ];
        let styleButtons = '';
        lineStyles.forEach(style => {
            styleButtons += `
                <button class="graph-line-style-option" data-style="${style.id}" style="
                    padding: 6px 8px;
                    background: ${this.lineStyle === style.id ? theme.toolbar.button.active : theme.toolbar.button.background};
                    color: ${this.lineStyle === style.id ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color};
                    border: 1px solid ${theme.toolbar.border};
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                ">
                    <div style="width:24px; height:2px; background:${theme.layout.textColor}; border-top:2px ${style.id} ${theme.layout.textColor};"></div>
                    <span>${style.name}</span>
                </button>
            `;
        });

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong style="font-size:12px;">${i18n.toolBar.lineStyle}</strong>
                <button class="graph-toolbar-close-panel" style="background:none; border:none; color:inherit; cursor:pointer; font-size:14px;">✕</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
                ${styleButtons}
            </div>
        `;
    }

    private createColorPanel(): HTMLElement {
        const panel = document.createElement('div');
        panel.className = 'graph-toolbar-color-panel';
        panel.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 8px;
            background: ${this.options.theme.toolbar.background};
            color: ${this.options.theme.layout.textColor};
            border: 1px solid ${this.options.theme.toolbar.border};
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            min-width: 280px;
            z-index: 1001;
            pointer-events: auto;
        `;
        panel.innerHTML = this.getColorPanelInnerHTML();
        return panel;
    }

    private createLineSizePanel(): HTMLElement {
        const panel = document.createElement('div');
        panel.className = 'graph-toolbar-size-panel';
        panel.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 8px;
            background: ${this.options.theme.toolbar.background};
            color: ${this.options.theme.layout.textColor};
            border: 1px solid ${this.options.theme.toolbar.border};
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            min-width: 120px;
            z-index: 1001;
            pointer-events: auto;
        `;
        panel.innerHTML = this.getLineSizePanelInnerHTML();
        return panel;
    }

    private createLineStylePanel(): HTMLElement {
        const panel = document.createElement('div');
        panel.className = 'graph-toolbar-style-panel';
        panel.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 8px;
            background: ${this.options.theme.toolbar.background};
            color: ${this.options.theme.layout.textColor};
            border: 1px solid ${this.options.theme.toolbar.border};
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            min-width: 120px;
            z-index: 1001;
            pointer-events: auto;
        `;
        panel.innerHTML = this.getLineStylePanelInnerHTML();
        return panel;
    }

    private bindEvents(): void {
        if (!this.container) return;
        this.container.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        this.container.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        this.container.addEventListener('mouseup', (e) => {
            e.stopPropagation();
        });
        const dragHandle = this.container.querySelector('.graph-toolbar-drag-handle');
        if (dragHandle) {
            dragHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const mouseEvent = e as MouseEvent;
                this.options.onDragStart({ x: mouseEvent.clientX, y: mouseEvent.clientY });
            });
        }
        const colorBtn = this.container.querySelector('.graph-toolbar-color-btn');
        if (colorBtn) {
            colorBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const existingPanel = this.container?.querySelector('.graph-toolbar-color-panel');
                if (existingPanel) {
                    existingPanel.remove();
                    this.activePanel = null;
                } else {
                    this.container?.querySelector('.graph-toolbar-size-panel')?.remove();
                    this.container?.querySelector('.graph-toolbar-style-panel')?.remove();
                    const panel = this.createColorPanel();
                    const mainToolbar = this.container?.querySelector('.graph-toolbar-main');
                    if (mainToolbar) {
                        mainToolbar.appendChild(panel);
                        this.activePanel = 'color';
                        this.bindPanelEvents(panel);
                    }
                }
            });
        }
        const sizeBtn = this.container.querySelector('.graph-toolbar-size-btn');
        if (sizeBtn) {
            sizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const existingPanel = this.container?.querySelector('.graph-toolbar-size-panel');
                if (existingPanel) {
                    existingPanel.remove();
                    this.activePanel = null;
                } else {
                    this.container?.querySelector('.graph-toolbar-color-panel')?.remove();
                    this.container?.querySelector('.graph-toolbar-style-panel')?.remove();
                    const panel = this.createLineSizePanel();
                    const mainToolbar = this.container?.querySelector('.graph-toolbar-main');
                    if (mainToolbar) {
                        mainToolbar.appendChild(panel);
                        this.activePanel = 'lineSize';
                        this.bindPanelEvents(panel);
                    }
                }
            });
        }
        const styleBtn = this.container.querySelector('.graph-toolbar-style-btn');
        if (styleBtn) {
            styleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const existingPanel = this.container?.querySelector('.graph-toolbar-style-panel');
                if (existingPanel) {
                    existingPanel.remove();
                    this.activePanel = null;
                } else {
                    this.container?.querySelector('.graph-toolbar-color-panel')?.remove();
                    this.container?.querySelector('.graph-toolbar-size-panel')?.remove();
                    const panel = this.createLineStylePanel();
                    const mainToolbar = this.container?.querySelector('.graph-toolbar-main');
                    if (mainToolbar) {
                        mainToolbar.appendChild(panel);
                        this.activePanel = 'lineStyle';
                        this.bindPanelEvents(panel);
                    }
                }
            });
        }
        const deleteBtn = this.container.querySelector('.graph-toolbar-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.options.onDelete();
            });
        }
        const closeBtn = this.container.querySelector('.graph-toolbar-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.options.onClose();
            });
        }
    }

    private bindPanelEvents(panelElement: HTMLElement): void {
        panelElement.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        panelElement.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        const colorOptions = panelElement.querySelectorAll('.graph-color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const color = option.getAttribute('data-color');
                if (color) {
                    this.currentColor = color;
                    this.options.onChangeColor(color);
                    const colorBtn = this.container?.querySelector('.graph-toolbar-color-btn');
                    if (colorBtn) {
                        const colorDiv = colorBtn.querySelector('div');
                        if (colorDiv) {
                            colorDiv.style.background = color;
                        }
                    }

                    panelElement.remove();
                    this.activePanel = null;
                }
            });
        });
        const sizeOptions = panelElement.querySelectorAll('.graph-line-size-option');
        sizeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const size = parseInt(option.getAttribute('data-size') || '1', 10);
                this.lineWidth = size;
                this.options.onChangeWidth(size);
                panelElement.remove();
                this.activePanel = null;
            });
        });
        const styleOptions = panelElement.querySelectorAll('.graph-line-style-option');
        styleOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const style = option.getAttribute('data-style') as 'solid' | 'dashed' | 'dotted';
                this.lineStyle = style;
                this.options.onChangeStyle(style);
                panelElement.remove();
                this.activePanel = null;
            });
        });
        const closePanelBtn = panelElement.querySelector('.graph-toolbar-close-panel');
        if (closePanelBtn) {
            closePanelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                panelElement.remove();
                this.activePanel = null;
            });
        }
    }

    public updatePosition(position: Point): void {
        if (this.container) {
            this.container.style.left = `${position.x}px`;
            this.container.style.top = `${position.y}px`;
        }
    }

    public updateTheme(theme: ThemeConfig): void {
        this.options.theme = theme;
        if (this.container) {
            const position = {
                x: parseInt(this.container.style.left, 10),
                y: parseInt(this.container.style.top, 10)
            };
            this.destroy();
            this.options.theme = theme;
            this.init();
            this.updatePosition(position);
        }
    }

    public updateI18n(i18n: I18n): void {
        this.options.i18n = i18n;
        if (this.container) {
            const position = {
                x: parseInt(this.container.style.left, 10),
                y: parseInt(this.container.style.top, 10)
            };
            this.destroy();
            this.init();
            this.updatePosition(position);
        }
    }

    public destroy(): void {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}