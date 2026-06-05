import { I18n } from '../i18n';
import { ThemeConfig } from '../theme';
import { MarkDrawing, Point } from '../types';

export interface TextMarkToolBarOptions {
    position: Point;
    selectedDrawing: MarkDrawing | null;
    theme: ThemeConfig;
    i18n: I18n;
    container: HTMLElement;
    onClose: () => void;
    onDelete: () => void;
    onChangeTextColor: (color: string) => void;
    onChangeTextStyle: (style: { isBold?: boolean; isItalic?: boolean }) => void;
    onChangeTextSize: (size: number) => void;
    onChangeGraphColor: (color: string) => void;
    onChangeGraphStyle: (lineStyle: 'solid' | 'dashed' | 'dotted') => void;
    onChangeGraphLineWidth: (width: number) => void;
    onDragStart: (point: Point) => void;
    isShowGrapTool?: boolean;
}

export class TextMarkToolBar {
    public container: HTMLElement | null = null;
    private options: TextMarkToolBarOptions;
    private activePanel: 'color' | 'fontSize' | 'graphColor' | 'graphLineSize' | 'graphLineStyle' | null = null;
    private fontColor: string;
    private fontSize: number = 14;
    private isBold: boolean = false;
    private isItalic: boolean = false;
    private graphColor: string;
    private graphWidth: number = 1;
    private graphStyle: 'solid' | 'dashed' | 'dotted' = 'solid';

    constructor(options: TextMarkToolBarOptions) {
        this.options = options;
        this.fontColor = options.selectedDrawing?.color || '#000000';
        this.fontSize = options.selectedDrawing?.fontSize || 14;
        this.isBold = options.selectedDrawing?.isBold || false;
        this.isItalic = options.selectedDrawing?.isItalic || false;
        this.graphColor = options.selectedDrawing?.graphColor || '#000000';
        this.graphWidth = options.selectedDrawing?.graphWidth || 1;
        this.graphStyle = (options.selectedDrawing?.graphStyle as 'solid' | 'dashed' | 'dotted') || 'solid';
        this.init();
    }

    public containsElement(element: Node): boolean {
        return this.container ? this.container.contains(element) : false;
    }

    public getContainer(): HTMLElement | null {
        return this.container;
    }

    private init(): void {
        this.createDOM();
        this.bindEvents();
    }

    private createDOM(): void {
        const { position, theme } = this.options;
        this.container = document.createElement('div');
        this.container.className = 'text-mark-toolbar';
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
        const { theme, i18n, isShowGrapTool } = this.options;
        const { activePanel, fontColor, fontSize, isBold, isItalic, graphColor } = this;

        return `
            <div class="text-toolbar-main" style="
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
                <div style="width:1px; height:24px; background:${theme.toolbar.border}; margin:0 4px;"></div>
                
                <!-- 文字颜色按钮 -->
                <div style="position:relative;">
                    <button class="text-toolbar-color-btn" style="
                        background: ${activePanel === 'color' ? theme.toolbar.button.active : theme.toolbar.button.background};
                        border: 1px solid ${theme.toolbar.border};
                        border-radius: 4px;
                        padding: 4px;
                        cursor: pointer;
                        width: 32px;
                        height: 32px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${theme.layout.textColor}" stroke-width="2">
                            <path d="M4 7L4 4L20 4L20 7" stroke-linecap="round"/>
                            <path d="M12 20L12 4" stroke-linecap="round"/>
                            <path d="M8 20L16 20" stroke-linecap="round"/>
                        </svg>
                        <div style="width:16px; height:3px; background:${fontColor}; border:1px solid ${theme.toolbar.border}; border-radius:1px; margin-top:2px;"></div>
                    </button>
                </div>
                
                <!-- 字体大小按钮 -->
                <div style="position:relative;">
                    <button class="text-toolbar-size-btn" style="
                        background: ${activePanel === 'fontSize' ? theme.toolbar.button.active : theme.toolbar.button.background};
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
                        A
                    </button>
                </div>
                
                <!-- 粗体按钮 -->
                <button class="text-toolbar-bold-btn" style="
                    background: ${isBold ? theme.toolbar.button.active : theme.toolbar.button.background};
                    color: ${isBold ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color};
                    border: 1px solid ${theme.toolbar.border};
                    border-radius: 4px;
                    padding: 6px;
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    transition: all 0.2s;
                ">
                    B
                </button>
                
                <!-- 斜体按钮 -->
                <button class="text-toolbar-italic-btn" style="
                    background: ${isItalic ? theme.toolbar.button.active : theme.toolbar.button.background};
                    color: ${isItalic ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color};
                    border: 1px solid ${theme.toolbar.border};
                    border-radius: 4px;
                    padding: 6px;
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-style: italic;
                    transition: all 0.2s;
                ">
                    I
                </button>
                
                ${isShowGrapTool ? `
                    <div style="width:1px; height:24px; background:${theme.toolbar.border}; margin:0 4px;"></div>
                    
                    <!-- 图形颜色按钮 -->
                    <div style="position:relative;">
                        <button class="text-toolbar-graph-color-btn" style="
                            background: ${activePanel === 'graphColor' ? theme.toolbar.button.active : theme.toolbar.button.background};
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
                            <div style="width:20px; height:20px; background:${graphColor}; border:1px solid ${theme.toolbar.border}; border-radius:2px;"></div>
                        </button>
                    </div>
                    
                    <!-- 图形线宽按钮 -->
                    <div style="position:relative;">
                        <button class="text-toolbar-graph-size-btn" style="
                            background: ${activePanel === 'graphLineSize' ? theme.toolbar.button.active : theme.toolbar.button.background};
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
                    
                    <!-- 图形线型按钮 -->
                    <div style="position:relative;">
                        <button class="text-toolbar-graph-style-btn" style="
                            background: ${activePanel === 'graphLineStyle' ? theme.toolbar.button.active : theme.toolbar.button.background};
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
                
                <!-- 删除按钮 -->
                <button class="text-toolbar-delete-btn" style="
                    background: ${theme.toolbar.button.background};
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
                    🗑️
                </button>
                
                <!-- 关闭按钮 -->
                <button class="text-toolbar-close-btn" style="
                    background: ${theme.toolbar.button.background};
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
            <div class="text-toolbar-drag-handle" style="
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
                <button class="text-color-option" data-color="${color}" style="
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
                <button class="text-toolbar-close-panel" style="background:none; border:none; color:inherit; cursor:pointer; font-size:16px;">✕</button>
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

    private getFontSizePanelInnerHTML(): string {
        const { theme, i18n } = this.options;
        const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];
        let sizeButtons = '';
        fontSizes.forEach(size => {
            sizeButtons += `
                <button class="text-font-size-option" data-size="${size}" style="
                    padding: 4px 6px;
                    background: ${this.fontSize === size ? theme.toolbar.button.active : theme.toolbar.button.background};
                    color: ${this.fontSize === size ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color};
                    border: 1px solid ${theme.toolbar.border};
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 10px;
                ">
                    ${size}
                </button>
            `;
        });

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <strong style="font-size:14px;">${i18n.toolBar.fontSize}</strong>
                <button class="text-toolbar-close-panel" style="background:none; border:none; color:inherit; cursor:pointer; font-size:16px;">✕</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
                <input type="range" min="8" max="48" value="${this.fontSize}" class="text-font-size-slider" style="width:100%;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px;">
                    <span>${i18n.toolBar.fontSize}:</span>
                    <span class="text-font-size-value">${this.fontSize}px</span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:4px; margin-top:8px;">
                    ${sizeButtons}
                </div>
            </div>
        `;
    }

    private getGraphColorPanelInnerHTML(): string {
        const { theme, i18n, selectedDrawing } = this.options;
        const colors = [
            '#FF0000', '#FF3333', '#FF6666', '#FF9999', '#FFCCCC',
            '#CC0000', '#CC3333', '#CC6666', '#CC9999', '#CCCCCC',
            '#00FF00', '#33FF33', '#66FF66', '#99FF99', '#CCFFCC',
            '#0000FF', '#3333FF', '#6666FF', '#9999FF', '#CCCCFF'
        ];

        let colorButtons = '';
        colors.forEach(color => {
            colorButtons += `
                <button class="text-graph-color-option" data-color="${color}" style="
                    width: 20px;
                    height: 20px;
                    background: ${color};
                    border: 1px solid ${theme.toolbar.border};
                    border-radius: 3px;
                    cursor: pointer;
                "></button>
            `;
        });

        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <strong style="font-size:14px;">${i18n.toolBar.selectColor}</strong>
                <button class="text-toolbar-close-panel" style="background:none; border:none; color:inherit; cursor:pointer; font-size:16px;">✕</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(10,1fr); gap:4px; margin-bottom:12px;">
                ${colorButtons}
            </div>
            <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-top:8px; padding:8px; background:${theme.toolbar.button.background}; border-radius:4px;">
                <span style="font-size:12px;">${i18n.toolBar.currentColor}:</span>
                <div style="width:24px; height:24px; background:${selectedDrawing?.graphColor || '#000000'}; border:1px solid ${theme.toolbar.border}; border-radius:3px;"></div>
                <span style="font-size:12px;">${selectedDrawing?.graphColor || '#000000'}</span>
            </div>
        `;
    }

    private getGraphLineSizePanelInnerHTML(): string {
        const { theme, i18n } = this.options;
        const lineSizes = [1, 2, 3, 4];
        let sizeButtons = '';
        lineSizes.forEach(size => {
            sizeButtons += `
                <button class="text-graph-size-option" data-size="${size}" style="
                    padding: 6px 8px;
                    background: ${this.graphWidth === size ? theme.toolbar.button.active : theme.toolbar.button.background};
                    color: ${this.graphWidth === size ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color};
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
                <button class="text-toolbar-close-panel" style="background:none; border:none; color:inherit; cursor:pointer; font-size:14px;">✕</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
                ${sizeButtons}
            </div>
        `;
    }

    private getGraphLineStylePanelInnerHTML(): string {
        const { theme, i18n } = this.options;
        const lineStyles = [
            { id: 'solid', name: i18n.toolBar.solid },
            { id: 'dashed', name: i18n.toolBar.dashed },
            { id: 'dotted', name: i18n.toolBar.dotted }
        ];
        let styleButtons = '';
        lineStyles.forEach(style => {
            styleButtons += `
                <button class="text-graph-style-option" data-style="${style.id}" style="
                    padding: 6px 8px;
                    background: ${this.graphStyle === style.id ? theme.toolbar.button.active : theme.toolbar.button.background};
                    color: ${this.graphStyle === style.id ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color};
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
                <button class="text-toolbar-close-panel" style="background:none; border:none; color:inherit; cursor:pointer; font-size:14px;">✕</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
                ${styleButtons}
            </div>
        `;
    }

    private createColorPanel(): HTMLElement {
        const panel = document.createElement('div');
        panel.className = 'text-toolbar-color-panel';
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

    private createFontSizePanel(): HTMLElement {
        const panel = document.createElement('div');
        panel.className = 'text-toolbar-size-panel';
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
            min-width: 180px;
            z-index: 1001;
            pointer-events: auto;
        `;
        panel.innerHTML = this.getFontSizePanelInnerHTML();
        return panel;
    }

    private createGraphColorPanel(): HTMLElement {
        const panel = document.createElement('div');
        panel.className = 'text-toolbar-graph-color-panel';
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
        panel.innerHTML = this.getGraphColorPanelInnerHTML();
        return panel;
    }

    private createGraphLineSizePanel(): HTMLElement {
        const panel = document.createElement('div');
        panel.className = 'text-toolbar-graph-size-panel';
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
        panel.innerHTML = this.getGraphLineSizePanelInnerHTML();
        return panel;
    }

    private createGraphLineStylePanel(): HTMLElement {
        const panel = document.createElement('div');
        panel.className = 'text-toolbar-graph-style-panel';
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
        panel.innerHTML = this.getGraphLineStylePanelInnerHTML();
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

        const dragHandle = this.container.querySelector('.text-toolbar-drag-handle');
        if (dragHandle) {
            dragHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const mouseEvent = e as MouseEvent;
                this.options.onDragStart({ x: mouseEvent.clientX, y: mouseEvent.clientY });
            });
        }

        const colorBtn = this.container.querySelector('.text-toolbar-color-btn');
        if (colorBtn) {
            colorBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const existingPanel = this.container?.querySelector('.text-toolbar-color-panel');
                if (existingPanel) {
                    existingPanel.remove();
                    this.activePanel = null;
                } else {
                    this.container?.querySelector('.text-toolbar-size-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-graph-color-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-graph-size-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-graph-style-panel')?.remove();
                    const panel = this.createColorPanel();
                    const mainToolbar = this.container?.querySelector('.text-toolbar-main');
                    if (mainToolbar) {
                        mainToolbar.appendChild(panel);
                        this.activePanel = 'color';
                        this.bindPanelEvents(panel);
                    }
                }
            });
        }

        const sizeBtn = this.container.querySelector('.text-toolbar-size-btn');
        if (sizeBtn) {
            sizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const existingPanel = this.container?.querySelector('.text-toolbar-size-panel');
                if (existingPanel) {
                    existingPanel.remove();
                    this.activePanel = null;
                } else {
                    this.container?.querySelector('.text-toolbar-color-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-graph-color-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-graph-size-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-graph-style-panel')?.remove();
                    const panel = this.createFontSizePanel();
                    const mainToolbar = this.container?.querySelector('.text-toolbar-main');
                    if (mainToolbar) {
                        mainToolbar.appendChild(panel);
                        this.activePanel = 'fontSize';
                        this.bindPanelEvents(panel);
                    }
                }
            });
        }

        const boldBtn = this.container.querySelector('.text-toolbar-bold-btn');
        if (boldBtn) {
            boldBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleBold();
            });
        }

        const italicBtn = this.container.querySelector('.text-toolbar-italic-btn');
        if (italicBtn) {
            italicBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleItalic();
            });
        }

        const graphColorBtn = this.container.querySelector('.text-toolbar-graph-color-btn');
        if (graphColorBtn) {
            graphColorBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const existingPanel = this.container?.querySelector('.text-toolbar-graph-color-panel');
                if (existingPanel) {
                    existingPanel.remove();
                    this.activePanel = null;
                } else {
                    this.container?.querySelector('.text-toolbar-color-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-size-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-graph-size-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-graph-style-panel')?.remove();
                    const panel = this.createGraphColorPanel();
                    const mainToolbar = this.container?.querySelector('.text-toolbar-main');
                    if (mainToolbar) {
                        mainToolbar.appendChild(panel);
                        this.activePanel = 'graphColor';
                        this.bindPanelEvents(panel);
                    }
                }
            });
        }

        const graphSizeBtn = this.container.querySelector('.text-toolbar-graph-size-btn');
        if (graphSizeBtn) {
            graphSizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const existingPanel = this.container?.querySelector('.text-toolbar-graph-size-panel');
                if (existingPanel) {
                    existingPanel.remove();
                    this.activePanel = null;
                } else {
                    this.container?.querySelector('.text-toolbar-color-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-size-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-graph-color-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-graph-style-panel')?.remove();
                    const panel = this.createGraphLineSizePanel();
                    const mainToolbar = this.container?.querySelector('.text-toolbar-main');
                    if (mainToolbar) {
                        mainToolbar.appendChild(panel);
                        this.activePanel = 'graphLineSize';
                        this.bindPanelEvents(panel);
                    }
                }
            });
        }

        const graphStyleBtn = this.container.querySelector('.text-toolbar-graph-style-btn');
        if (graphStyleBtn) {
            graphStyleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const existingPanel = this.container?.querySelector('.text-toolbar-graph-style-panel');
                if (existingPanel) {
                    existingPanel.remove();
                    this.activePanel = null;
                } else {
                    this.container?.querySelector('.text-toolbar-color-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-size-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-graph-color-panel')?.remove();
                    this.container?.querySelector('.text-toolbar-graph-size-panel')?.remove();
                    const panel = this.createGraphLineStylePanel();
                    const mainToolbar = this.container?.querySelector('.text-toolbar-main');
                    if (mainToolbar) {
                        mainToolbar.appendChild(panel);
                        this.activePanel = 'graphLineStyle';
                        this.bindPanelEvents(panel);
                    }
                }
            });
        }

        const deleteBtn = this.container.querySelector('.text-toolbar-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.options.onDelete();
            });
        }

        const closeBtn = this.container.querySelector('.text-toolbar-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.options.onClose();
            });
        }
    }

    private toggleBold = (): void => {
        this.isBold = !this.isBold;
        this.options.onChangeTextStyle({ isBold: this.isBold });
        this.updateBoldButton();
    };

    private toggleItalic = (): void => {
        this.isItalic = !this.isItalic;
        this.options.onChangeTextStyle({ isItalic: this.isItalic });
        this.updateItalicButton();
    };

    private updateBoldButton(): void {
        const boldBtn = this.container?.querySelector('.text-toolbar-bold-btn');
        if (boldBtn) {
            const theme = this.options.theme;
            (boldBtn as HTMLElement).style.background = this.isBold ? theme.toolbar.button.active : theme.toolbar.button.background;
            (boldBtn as HTMLElement).style.color = this.isBold ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color;
        }
    }

    private updateItalicButton(): void {
        const italicBtn = this.container?.querySelector('.text-toolbar-italic-btn');
        if (italicBtn) {
            const theme = this.options.theme;
            (italicBtn as HTMLElement).style.background = this.isItalic ? theme.toolbar.button.active : theme.toolbar.button.background;
            (italicBtn as HTMLElement).style.color = this.isItalic ? theme.toolbar.button.activeTextColor : theme.toolbar.button.color;
        }
    }

    private bindPanelEvents(panelElement: HTMLElement): void {
        panelElement.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        panelElement.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        const colorOptions = panelElement.querySelectorAll('.text-color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const color = option.getAttribute('data-color');
                if (color) {
                    this.fontColor = color;
                    this.options.onChangeTextColor(color);
                    const colorBtn = this.container?.querySelector('.text-toolbar-color-btn');
                    if (colorBtn) {
                        const colorDiv = colorBtn.querySelector('div:last-child');
                        if (colorDiv) {
                            (colorDiv as HTMLElement).style.background = color;
                        }
                    }
                    panelElement.remove();
                    this.activePanel = null;
                }
            });
        });

        const fontSizeOptions = panelElement.querySelectorAll('.text-font-size-option');
        fontSizeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const size = parseInt(option.getAttribute('data-size') || '14', 10);
                this.fontSize = size;
                this.options.onChangeTextSize(size);
                panelElement.remove();
                this.activePanel = null;
            });
        });

        const slider = panelElement.querySelector('.text-font-size-slider');
        if (slider) {
            slider.addEventListener('input', (e) => {
                e.stopPropagation();
                const value = parseInt((e.target as HTMLInputElement).value, 10);
                this.fontSize = value;
                const valueSpan = panelElement.querySelector('.text-font-size-value');
                if (valueSpan) {
                    valueSpan.textContent = `${value}px`;
                }
                this.options.onChangeTextSize(value);
            });
        }

        const graphColorOptions = panelElement.querySelectorAll('.text-graph-color-option');
        graphColorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const color = option.getAttribute('data-color');
                if (color) {
                    this.graphColor = color;
                    this.options.onChangeGraphColor(color);
                    const graphColorBtn = this.container?.querySelector('.text-toolbar-graph-color-btn');
                    if (graphColorBtn) {
                        const colorDiv = graphColorBtn.querySelector('div');
                        if (colorDiv) {
                            (colorDiv as HTMLElement).style.background = color;
                        }
                    }
                    panelElement.remove();
                    this.activePanel = null;
                }
            });
        });

        const graphSizeOptions = panelElement.querySelectorAll('.text-graph-size-option');
        graphSizeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const size = parseInt(option.getAttribute('data-size') || '1', 10);
                this.graphWidth = size;
                this.options.onChangeGraphLineWidth(size);
                panelElement.remove();
                this.activePanel = null;
            });
        });

        const graphStyleOptions = panelElement.querySelectorAll('.text-graph-style-option');
        graphStyleOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const style = option.getAttribute('data-style') as 'solid' | 'dashed' | 'dotted';
                this.graphStyle = style;
                this.options.onChangeGraphStyle(style);
                panelElement.remove();
                this.activePanel = null;
            });
        });

        const closePanelBtn = panelElement.querySelector('.text-toolbar-close-panel');
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

    public destroy(): void {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}