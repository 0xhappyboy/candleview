import { CandleView } from "./CandleView";

export function captureWithCanvas(candleView: CandleView) {
    const container = candleView.candleViewContainerRef.current;
    if (!container) return;
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = candleView.state.currentTheme.layout.background.color;
        ctx.fillRect(0, 0, width, height);
        const chartCanvases = container.querySelectorAll('canvas');
        const sortedCanvases = Array.from(chartCanvases).sort((a, b) => {
            const aZIndex = parseInt(window.getComputedStyle(a).zIndex) || 0;
            const bZIndex = parseInt(window.getComputedStyle(b).zIndex) || 0;
            return aZIndex - bZIndex;
        });
        sortedCanvases.forEach((chartCanvas) => {
            try {
                const rect = chartCanvas.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                const x = rect.left - containerRect.left;
                const y = rect.top - containerRect.top;
                ctx.drawImage(chartCanvas, x, y, rect.width, rect.height);
            } catch (error) {
                console.error(error);
            }
        });
        drawHTMLElementsToCanvas(candleView, container, ctx, width, height);
        const link = document.createElement('a');
        link.download = `chart-screenshot-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error(error);
    }
};

export function drawHTMLElementsToCanvas(candleView: CandleView, container: HTMLElement, ctx: CanvasRenderingContext2D, width: number, height: number) {
    const elementsToDraw = Array.from(
        container.querySelectorAll('.chart-info-panel, .toolbar, [candleview-container] > div:not([style*="position: absolute"])')
    );
    elementsToDraw.forEach(element => {
        drawElementToCanvas(candleView, element as HTMLElement, ctx, container);
    });
};

export function drawElementToCanvas(candleView: CandleView, element: HTMLElement, ctx: CanvasRenderingContext2D, container: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCanvas.width = rect.width;
    tempCanvas.height = rect.height;
    drawElementContent(candleView, element, tempCtx, rect.width, rect.height);
    ctx.drawImage(tempCanvas, x, y, rect.width, rect.height);
};

export function drawElementContent(candleView: CandleView, element: HTMLElement, ctx: CanvasRenderingContext2D, width: number, height: number) {
    const textContent = element.textContent || '';
    if (textContent.trim()) {
        ctx.fillStyle = candleView.state.currentTheme.layout.textColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const lines = wrapText(candleView, ctx, textContent, width - 20);
        lines.forEach((line, index) => {
            ctx.fillText(line, 10, 10 + index * 16);
        });
    }
};

export function wrapText(candleView: CandleView, ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
};

