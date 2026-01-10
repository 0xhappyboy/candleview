export interface DanmakuStyle {
  color: string;
  fontSize: number;
  speed: number;
  opacity: number;
  yPosition: number;
}

export interface DanmakuItem {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  style: DanmakuStyle;
  startTime: number;
  isVisible: boolean;
}

export interface DanmakuConfig {
  maxConcurrent: number;
  defaultStyle: DanmakuStyle;
  fontFamily: string;
  lineHeight: number;
  autoStart: boolean;
}

export class DanmakuManager {
  private danmakus: string[] = [];
  private activeDanmakus: DanmakuItem[] = [];
  private config: DanmakuConfig;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private lastUpdateTime: number = 0;
  private isPlaying: boolean = false;
  private containerWidth: number = 0;
  private containerHeight: number = 0;
  private danmakuPool: DanmakuItem[] = [];

  constructor(config?: Partial<DanmakuConfig>) {
    this.config = {
      maxConcurrent: 10,
      defaultStyle: {
        color: '#FFFFFF',
        fontSize: 16,
        speed: 60,
        opacity: 0.9,
        yPosition: 0.5
      },
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.2,
      autoStart: true,
      ...config
    };
  }

  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.textBaseline = 'middle';
    }
    this.updateCanvasSize();
    if (this.config.autoStart) {
      this.start();
    }
  }

  updateCanvasSize(): void {
    if (this.canvas) {
      this.containerWidth = this.canvas.width;
      this.containerHeight = this.canvas.height;
    }
  }

  setDanmakus(danmakus: string[]): void {
    this.danmakus = [...danmakus];
  }

  addDanmaku(text: string): void {
    this.danmakus.push(text);
  }

  addDanmakus(texts: string[]): void {
    this.danmakus.push(...texts);
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.lastUpdateTime = performance.now();
    this.animate();
  }

  stop(): void {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  clear(): void {
    this.danmakus = [];
    this.activeDanmakus = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  getActiveCount(): number {
    return this.activeDanmakus.length;
  }

  getPendingCount(): number {
    return this.danmakus.length;
  }

  destroy(): void {
    this.stop();
    this.clear();
    this.canvas = null;
    this.ctx = null;
    this.danmakuPool = [];
  }

  private getDanmakuItem(text: string): DanmakuItem {
    if (this.danmakuPool.length > 0) {
      const item = this.danmakuPool.pop()!;
      item.text = text;
      item.isVisible = true;
      item.startTime = performance.now();
      return item;
    }
    return {
      id: `danmaku_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      x: 0,
      y: 0,
      width: 0,
      style: this.getRandomStyle(),
      startTime: performance.now(),
      isVisible: true
    };
  }

  private recycleDanmakuItem(item: DanmakuItem): void {
    item.isVisible = false;
    this.danmakuPool.push(item);
  }

  private getRandomStyle(): DanmakuStyle {
    const colors = [
      '#FFFFFF', '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
      '#118AB2', '#EF476F', '#073B4C', '#7209B7', '#F72585'
    ];
    const fontSizes = [14, 16, 18];
    const speeds = [50, 60, 70, 80];
    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      fontSize: fontSizes[Math.floor(Math.random() * fontSizes.length)],
      speed: speeds[Math.floor(Math.random() * speeds.length)],
      opacity: 0.8 + Math.random() * 0.2, // 0.8-1.0
      yPosition: 0.1 + Math.random() * 0.8 // 0.1-0.9
    };
  }

  private measureTextWidth(text: string, fontSize: number): number {
    if (!this.ctx) return 100;
    this.ctx.save();
    this.ctx.font = `${fontSize}px ${this.config.fontFamily}`;
    const width = this.ctx.measureText(text).width;
    this.ctx.restore();
    return width;
  }

  private spawnDanmaku(): void {
    if (this.activeDanmakus.length >= this.config.maxConcurrent) {
      return;
    }
    if (this.danmakus.length === 0) {
      return;
    }
    const text = this.danmakus.shift()!;
    const danmaku = this.getDanmakuItem(text);
    danmaku.width = this.measureTextWidth(text, danmaku.style.fontSize);
    danmaku.x = this.containerWidth;
    danmaku.y = danmaku.style.yPosition * this.containerHeight;
    this.activeDanmakus.push(danmaku);
  }

  private updateDanmakus(deltaTime: number): void {
    for (let i = this.activeDanmakus.length - 1; i >= 0; i--) {
      const danmaku = this.activeDanmakus[i];
      danmaku.x -= danmaku.style.speed * (deltaTime / 1000);
      if (danmaku.x + danmaku.width < 0) {
        this.recycleDanmakuItem(danmaku);
        this.activeDanmakus.splice(i, 1);
      }
    }
    this.spawnDanmaku();
  }

  private renderDanmakus(): void {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.activeDanmakus.forEach(danmaku => {
      this.ctx!.save();
      this.ctx!.font = `${danmaku.style.fontSize}px ${this.config.fontFamily}`;
      this.ctx!.fillStyle = danmaku.style.color;
      this.ctx!.globalAlpha = danmaku.style.opacity;
      this.ctx!.shadowColor = 'rgba(0, 0, 0, 0.5)';
      this.ctx!.shadowBlur = 2;
      this.ctx!.shadowOffsetX = 1;
      this.ctx!.shadowOffsetY = 1;
      this.ctx!.fillText(danmaku.text, danmaku.x, danmaku.y);
      this.ctx!.restore();
    });
  }

  private animate(): void {
    if (!this.isPlaying) return;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;
    this.updateDanmakus(deltaTime);
    this.renderDanmakus();
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}