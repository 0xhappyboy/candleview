import { ISeriesPrimitive, Time, SeriesAttachedParameter } from "lightweight-charts";
import { ThemeConfig } from "../CandleViewTheme";
import { Point } from "../types";

export interface PaneInfoConfig {
    name: string;
    param1?: string;
    param2?: string;
    onSettingsClick?: () => void;
    onCloseClick?: () => void;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    theme: ThemeConfig;
}

export class PaneInfo implements ISeriesPrimitive<Time> {
    private _chart: any;
    private _series: any;
    private _renderer: any;

    private _name: string;
    private _params: { name: string, value: string, color: string }[] = [
        { name: "p1", value: "123", color: "red" },
        { name: "p1", value: "123", color: "red" },
        { name: "p1", value: "123", color: "red" },
        { name: "p1", value: "123", color: "red" },
    ];
    private _onSettingsClick: () => void;
    private _onCloseClick: () => void;
    private _textColor: string;
    private _fontSize: number;
    private _theme: ThemeConfig;

    private readonly _buttonSize = 16;
    private readonly _buttonMargin = 8;
    private readonly _padding = 10;
    private readonly _paramItemMargin = 10;
    private readonly _paramAreaLeftMargin = 12;

    constructor(config: PaneInfoConfig) {
        this._name = config.name || "test";
        this._onSettingsClick = config.onSettingsClick || (() => console.log('setting'));
        this._onCloseClick = config.onCloseClick || (() => console.log('close'));
        this._textColor = config.textColor || 'white';
        this._fontSize = config.fontSize || 12;
        this._theme = config.theme;
        this._textColor = this._theme.layout.textColor;
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
        const nameArea = {
            x: 10,
            y: 5,
            width: this._getTextWidth(this._name, this._fontSize),
            height: totalHeight
        };
        const settingsButton = {
            x: nameArea.x + nameArea.width + this._buttonMargin,
            y: nameArea.y + (totalHeight - this._buttonSize) / 2,
            width: this._buttonSize,
            height: this._buttonSize
        };
        const closeButton = {
            x: settingsButton.x + this._buttonSize + this._buttonMargin,
            y: nameArea.y + (totalHeight - this._buttonSize) / 2,
            width: this._buttonSize,
            height: this._buttonSize
        };
        const paramsStartX = closeButton.x + this._buttonSize + this._paramAreaLeftMargin;
        const paramsArea = {
            x: paramsStartX,
            y: nameArea.y,
            width: totalWidth - paramsStartX - this._padding,
            height: totalHeight
        };
        return {
            nameArea,
            settingsButton,
            closeButton,
            paramsArea
        };
    }

    private _getTextWidth(text: string, fontSize: number): number {
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx) return text.length * fontSize * 0.6;
        ctx.font = `${fontSize}px Arial`;
        return ctx.measureText(text).width;
    }

    private _getTotalWidth(): number {
        const nameWidth = this._getTextWidth(this._name, this._fontSize);
        let paramsTotalWidth = 0;
        this._params.forEach((param, index) => {
            const paramText = `${param.name}: ${param.value}`;
            const paramWidth = this._getTextWidth(paramText, this._fontSize);
            paramsTotalWidth += paramWidth;
            if (index < this._params.length - 1) {
                paramsTotalWidth += this._paramItemMargin;
            }
        });
        const buttonsWidth = this._buttonSize * 2 + this._buttonMargin * 2;
        const totalContentWidth = nameWidth + buttonsWidth + paramsTotalWidth +
            this._padding * 2 + this._paramItemMargin;
        return Math.max(totalContentWidth, 150);
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
                    this._drawName(ctx, layout.nameArea);
                    this._drawSettingsButton(ctx, layout.settingsButton);
                    this._drawCloseButton(ctx, layout.closeButton);
                    this._drawParams(ctx, layout.paramsArea);
                    ctx.restore();
                }
            };
        }
        return [{ renderer: () => this._renderer }];
    }

    private _drawName(ctx: CanvasRenderingContext2D, rect: { x: number, y: number, width: number, height: number }) {
        ctx.fillStyle = this._textColor;
        ctx.font = `${this._fontSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const textY = rect.y + rect.height / 2 + 1.5;
        ctx.fillText(this._name, rect.x, textY);
    }

    private _drawParams(ctx: CanvasRenderingContext2D, rect: { x: number, y: number, width: number, height: number }) {
        if (this._params.length === 0) return;

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const textY = rect.y + rect.height / 2;
        let currentX = rect.x;

        this._params.forEach((param, index) => {
            const paramText = `${param.name}: ${param.value}`;
            ctx.fillStyle = param.color;
            ctx.font = `${this._fontSize}px Arial`;
            ctx.fillText(paramText, currentX, textY);
            currentX += this._getTextWidth(paramText, this._fontSize) + this._paramItemMargin;
        });
    }

    private _drawSettingsButton(ctx: CanvasRenderingContext2D, rect: { x: number, y: number, width: number, height: number }) {
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const scale = 0.7;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.strokeStyle = this._textColor;
        ctx.lineWidth = 2;
        ctx.fillStyle = 'transparent';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.stroke();
        const teethCount = 8;
        const innerRadius = 7;
        const outerRadius = 10;
        for (let i = 0; i < teethCount; i++) {
            const angle = (i * Math.PI * 2) / teethCount;
            const startX = Math.cos(angle) * innerRadius;
            const startY = Math.sin(angle) * innerRadius;
            const endX = Math.cos(angle) * outerRadius;
            const endY = Math.sin(angle) * outerRadius;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        ctx.restore();
    }

    private _drawCloseButton(ctx: CanvasRenderingContext2D, rect: { x: number, y: number, width: number, height: number }) {
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const size = 4.5;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.strokeStyle = this._textColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size, -size);
        ctx.lineTo(size, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(size, -size);
        ctx.lineTo(-size, size);
        ctx.stroke();
        ctx.restore();
    }

    updateConfig(config: Partial<PaneInfoConfig>) {
        if (config.name !== undefined) this._name = config.name;
        if (config.textColor !== undefined) this._textColor = config.textColor;
        if (config.fontSize !== undefined) this._fontSize = config.fontSize;
        if (config.theme !== undefined) {
            this._theme = config.theme;
            this._textColor = this._theme.layout.textColor;
        }
        if (this._series) {
            this._series.requestUpdate();
        }
    }

    updateParams(params: { name: string, value: string, color: string }[]) {
        this._params = params || [];
        if (this._series) {
            this._series.requestUpdate();
        }
    }

    updateTheme(theme: ThemeConfig) {
        this._theme = theme;
        this._textColor = theme.layout.textColor;
        if (this._series) {
            this._series.requestUpdate();
        }
    }

    handleMouseDown(poin: Point): void { }

    handleMouseMove(poin: Point): void { }

    handleMouseUp(poin: Point): void { }
}