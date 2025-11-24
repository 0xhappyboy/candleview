import { ISeriesPrimitive, Time, SeriesAttachedParameter } from "lightweight-charts";

export interface PaneInfoConfig {
    name: string;
    param1?: string;
    param2?: string;
    onSettingsClick?: () => void;
    onCloseClick?: () => void;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
}

export class PaneInfo implements ISeriesPrimitive<Time> {
    private _chart: any;
    private _series: any;
    private _renderer: any;

    private _name: string;
    private _param1: string;
    private _param2: string;
    private _onSettingsClick: () => void;
    private _onCloseClick: () => void;
    private _backgroundColor: string;
    private _textColor: string;
    private _fontSize: number;

    private readonly _buttonSize = 16;
    private readonly _buttonMargin = 4;
    private readonly _padding = 8;

    constructor(config: PaneInfoConfig) {
        this._name = config.name || "未命名";
        this._param1 = config.param1 || "";
        this._param2 = config.param2 || "";
        this._onSettingsClick = config.onSettingsClick || (() => console.log('设置按钮被点击'));
        this._onCloseClick = config.onCloseClick || (() => console.log('关闭按钮被点击'));
        this._backgroundColor = config.backgroundColor || 'rgba(0, 123, 255, 0.9)';
        this._textColor = config.textColor || 'white';
        this._fontSize = config.fontSize || 12;
    }

    attached(param: SeriesAttachedParameter<Time, 'Candlestick'>) {
        this._chart = param.chart;
        this._series = param.series;
        const chartElement = this._chart.chartElement();
        if (chartElement) {
            chartElement.addEventListener('click', this._handleClick.bind(this));
        }
        param.requestUpdate();
    }

    detached() {
        const chartElement = this._chart?.chartElement();
        if (chartElement) {
            chartElement.removeEventListener('click', this._handleClick.bind(this));
        }
    }

    private _handleClick(event: MouseEvent) {
        const rect = this._chart.chartElement().getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const layout = this._calculateLayout();
        if (this._isPointInRect(x, y, layout.settingsButton)) {
            this._onSettingsClick();
            return;
        }
        if (this._isPointInRect(x, y, layout.closeButton)) {
            this._onCloseClick();
            return;
        }
    }

    private _isPointInRect(x: number, y: number, rect: { x: number, y: number, width: number, height: number }): boolean {
        return x >= rect.x && x <= rect.x + rect.width &&
            y >= rect.y && y <= rect.y + rect.height;
    }

    private _calculateLayout() {
        const totalWidth = this._getTotalWidth();
        const totalHeight = 30;
        const background = {
            x: 10,
            y: 10,
            width: totalWidth,
            height: totalHeight
        };
        const settingsButton = {
            x: background.x + background.width - this._buttonSize * 2 - this._buttonMargin * 2,
            y: background.y + (background.height - this._buttonSize) / 2,
            width: this._buttonSize,
            height: this._buttonSize
        };
        const closeButton = {
            x: background.x + background.width - this._buttonSize - this._buttonMargin,
            y: background.y + (background.height - this._buttonSize) / 2,
            width: this._buttonSize,
            height: this._buttonSize
        };
        return {
            background,
            settingsButton,
            closeButton
        };
    }

    private _getTotalWidth(): number {
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx) return 200;
        ctx.font = `${this._fontSize}px Arial`;
        const nameWidth = ctx.measureText(this._name).width;
        const param1Width = this._param1 ? ctx.measureText(this._param1).width : 0;
        const param2Width = this._param2 ? ctx.measureText(this._param2).width : 0;
        const textWidth = nameWidth + (this._param1 ? param1Width + 20 : 0) + (this._param2 ? param2Width + 20 : 0);
        const buttonsWidth = this._buttonSize * 2 + this._buttonMargin * 3;
        return Math.max(textWidth + buttonsWidth + this._padding * 2, 150);
    }

    updateAllViews() {
    }

    paneViews() {
        if (!this._renderer) {
            this._renderer = {
                draw: (target: any) => {
                    const ctx = target.context ?? target._context;
                    if (!ctx || !this._chart) return;
                    ctx.save();
                    const layout = this._calculateLayout();
                    this._drawBackground(ctx, layout.background);
                    this._drawTexts(ctx, layout);
                    this._drawSettingsButton(ctx, layout.settingsButton);
                    this._drawCloseButton(ctx, layout.closeButton);
                    ctx.restore();
                }
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private _drawBackground(ctx: CanvasRenderingContext2D, rect: { x: number, y: number, width: number, height: number }) {
        ctx.fillStyle = this._backgroundColor;
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(rect.x + radius, rect.y);
        ctx.lineTo(rect.x + rect.width - radius, rect.y);
        ctx.quadraticCurveTo(rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + radius);
        ctx.lineTo(rect.x + rect.width, rect.y + rect.height - radius);
        ctx.quadraticCurveTo(rect.x + rect.width, rect.y + rect.height, rect.x + rect.width - radius, rect.y + rect.height);
        ctx.lineTo(rect.x + radius, rect.y + rect.height);
        ctx.quadraticCurveTo(rect.x, rect.y + rect.height, rect.x, rect.y + rect.height - radius);
        ctx.lineTo(rect.x, rect.y + radius);
        ctx.quadraticCurveTo(rect.x, rect.y, rect.x + radius, rect.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    private _drawTexts(ctx: CanvasRenderingContext2D, layout: any) {
        ctx.fillStyle = this._textColor;
        ctx.font = `${this._fontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const textY = layout.background.y + layout.background.height / 2;
        let currentX = layout.background.x + this._padding;
        ctx.fillText(this._name, currentX, textY);
        currentX += ctx.measureText(this._name).width + 10;
        if (this._param1) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = `${this._fontSize - 1}px Arial`;
            ctx.fillText(this._param1, currentX, textY);
            currentX += ctx.measureText(this._param1).width + 10;
        }
        if (this._param2) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = `${this._fontSize - 1}px Arial`;
            ctx.fillText(this._param2, currentX, textY);
        }
    }

    private _drawSettingsButton(ctx: CanvasRenderingContext2D, rect: { x: number, y: number, width: number, height: number }) {
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const radius = rect.width / 3;
        ctx.strokeStyle = this._textColor;
        ctx.lineWidth = 1.5;
        ctx.fillStyle = 'transparent';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        const toothLength = radius * 0.6;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
            );
            ctx.lineTo(
                centerX + Math.cos(angle) * (radius + toothLength),
                centerY + Math.sin(angle) * (radius + toothLength)
            );
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
        ctx.stroke();
    }

    private _drawCloseButton(ctx: CanvasRenderingContext2D, rect: { x: number, y: number, width: number, height: number }) {
        const margin = 4;
        ctx.strokeStyle = this._textColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rect.x + margin, rect.y + margin);
        ctx.lineTo(rect.x + rect.width - margin, rect.y + rect.height - margin);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rect.x + rect.width - margin, rect.y + margin);
        ctx.lineTo(rect.x + margin, rect.y + rect.height - margin);
        ctx.stroke();
    }

    updateConfig(config: Partial<PaneInfoConfig>) {
        if (config.name !== undefined) this._name = config.name;
        if (config.param1 !== undefined) this._param1 = config.param1;
        if (config.param2 !== undefined) this._param2 = config.param2;
        if (config.backgroundColor !== undefined) this._backgroundColor = config.backgroundColor;
        if (config.textColor !== undefined) this._textColor = config.textColor;
        if (config.fontSize !== undefined) this._fontSize = config.fontSize;
        if (this._chart) {
            this._chart.requestUpdate();
        }
    }

    updateParams(param1?: string, param2?: string) {
        if (param1 !== undefined) this._param1 = param1;
        if (param2 !== undefined) this._param2 = param2;

        if (this._chart) {
            this._chart.requestUpdate();
        }
    }
}