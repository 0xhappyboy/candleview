import { Drawing, Point } from "../types";

export interface EmojiElement {
  id: string;
  element: HTMLDivElement;
  emojiElement: HTMLDivElement;
  drawing: Drawing;
  position: Point;
  isDragging: boolean;
  dragStart: Point;
  scaleHandle?: HTMLDivElement;
  isScaling?: boolean;
}

export class EmojiManager {
  private emojiElements: Map<string, EmojiElement> = new Map();
  private container: HTMLElement;
  private onEmojiClick?: (toolId: string) => void;
  private isEnabled: boolean = true;
  private scaleHandleSize: number = 8;

  constructor(container: HTMLElement, onEmojiClick?: (toolId: string) => void) {
    this.container = container;
    this.onEmojiClick = onEmojiClick;
    this.setupContainer();
  }

  private setupContainer() {
    if (this.container.style.position !== 'absolute' &&
      this.container.style.position !== 'relative') {
      this.container.style.position = 'relative';
    }
    this.container.style.overflow = 'visible';
  }

  public updateEmoji(drawing: Drawing): EmojiElement {
    if (!drawing.properties?.emoji) {
      console.log('Emoji 数据不完整:', drawing);
      throw new Error('Emoji 数据不完整');
    }

    const id = drawing.id;
    const emoji = drawing.properties.emoji as string;
    const fontSize = drawing.properties.fontSize as number || 24;
    const point = drawing.points[0];

    let emojiElement = this.emojiElements.get(id);

    if (!emojiElement) {
      console.log('创建新的 Emoji 元素');
      // 创建主 Emoji 元素
      const emojiDiv = document.createElement('div');
      emojiDiv.className = 'drawing-emoji-element';
      emojiDiv.setAttribute('data-emoji-id', id);
      emojiDiv.style.cssText = `
        position: relative;
        font-size: ${fontSize}px;
        line-height: 1;
        cursor: move;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        pointer-events: auto;
        display: inline-block;
        width: ${fontSize}px;
        height: ${fontSize}px;
      `;
      emojiDiv.textContent = emoji;
      // 创建缩放手柄
      const scaleHandle = document.createElement('div');
      scaleHandle.className = 'emoji-scale-handle';
      scaleHandle.setAttribute('data-emoji-handle', id);
      // 计算缩放手柄位置 - 固定在右下角
      const handlePosition = this.calculateScaleHandlePosition(fontSize);
      scaleHandle.style.cssText = `
        position: absolute;
        width: ${this.scaleHandleSize}px;
        height: ${this.scaleHandleSize}px;
        background: #4f46e5;
        border: 1px solid #ffffff;
        border-radius: 50%;
        cursor: nwse-resize;
        z-index: 101;
        pointer-events: auto;
        display: none;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: all 0.1s ease;
        left: ${handlePosition.x}px;
        top: ${handlePosition.y}px;
      `;
      // 创建容器包裹 Emoji 和缩放手柄
      const container = document.createElement('div');
      container.className = 'emoji-container';
      container.setAttribute('data-emoji-container', id);
      const containerX = point.x - fontSize / 2;
      const containerY = point.y - fontSize / 2;
      container.style.cssText = `
        position: absolute;
        left: ${containerX}px;
        top: ${containerY}px;
        display: inline-block;
        z-index: 100;
        width: ${fontSize}px;
        height: ${fontSize}px;
      `;
      container.appendChild(emojiDiv);
      container.appendChild(scaleHandle);
      this.container.appendChild(container);
      emojiElement = {
        id: drawing.id,
        element: container, // 容器是主元素
        emojiElement: emojiDiv, // 实际的 emoji 元素
        drawing: { ...drawing },
        position: { x: containerX, y: containerY },
        isDragging: false,
        dragStart: { x: 0, y: 0 },
        scaleHandle: scaleHandle,
        isScaling: false
      };
      this.emojiElements.set(id, emojiElement);
      this.setupEventListeners(emojiElement);
    } else {
      // 更新现有元素
      const fontSize = drawing.properties.fontSize as number || 24;
      const newX = point.x - fontSize / 2;
      const newY = point.y - fontSize / 2;

      emojiElement.element.style.left = `${newX}px`;
      emojiElement.element.style.top = `${newY}px`;
      emojiElement.element.style.width = `${fontSize}px`;
      emojiElement.element.style.height = `${fontSize}px`;
      emojiElement.emojiElement.style.fontSize = `${fontSize}px`;
      emojiElement.emojiElement.style.width = `${fontSize}px`;
      emojiElement.emojiElement.style.height = `${fontSize}px`;
      emojiElement.emojiElement.textContent = emoji;
      emojiElement.drawing = { ...drawing };
      emojiElement.position = { x: newX, y: newY };

      // 更新缩放手柄位置
      this.updateScaleHandlePosition(emojiElement);
    }

    return emojiElement;
  }

  // 计算缩放手柄位置 - 固定在右下角
  private calculateScaleHandlePosition(fontSize: number): Point {
    const handleOffset = this.scaleHandleSize / 2;
    return {
      x: fontSize - this.scaleHandleSize + handleOffset,
      y: fontSize - this.scaleHandleSize + handleOffset
    };
  }

  // 更新缩放手柄位置
  private updateScaleHandlePosition(element: EmojiElement) {
    if (!element.scaleHandle) return;

    const fontSize = element.drawing.properties?.fontSize as number || 24;
    const handlePosition = this.calculateScaleHandlePosition(fontSize);

    element.scaleHandle.style.left = `${handlePosition.x}px`;
    element.scaleHandle.style.top = `${handlePosition.y}px`;

    // 同时更新容器大小
    element.element.style.width = `${fontSize}px`;
    element.element.style.height = `${fontSize}px`;
    element.emojiElement.style.width = `${fontSize}px`;
    element.emojiElement.style.height = `${fontSize}px`;
  }

  private setupEventListeners(element: EmojiElement) {
    const { element: container, emojiElement, scaleHandle } = element;
    emojiElement.addEventListener('mousedown', (e) => {
      if (!this.isEnabled) return;
      setTimeout(() => {
        console.log('Emoji 被点击，执行完整处理逻辑');
        if (this.onEmojiClick) {
          console.log('切换到 Emoji 模式');
          this.onEmojiClick('emoji');
        }
        if (scaleHandle) {
          scaleHandle.style.display = 'block';
          console.log('显示缩放手柄');
        }
        const customEvent = new CustomEvent('emojiSelected', {
          detail: {
            emojiId: element.id,
            originalEvent: e
          },
          bubbles: true
        });
        this.container.dispatchEvent(customEvent);
        this.startDragging(element, e);
      }, 0);
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    });


    if (scaleHandle) {
      scaleHandle.addEventListener('mousedown', (e) => {
        if (!this.isEnabled) return;
        e.stopPropagation();
        e.preventDefault();
        this.startScaling(element, e);
      });
      scaleHandle.addEventListener('mouseenter', () => {
        scaleHandle.style.transform = 'scale(1.2)';
        scaleHandle.style.background = '#6366f1';
      });
      scaleHandle.addEventListener('mouseleave', () => {
        if (!element.isScaling) {
          scaleHandle.style.transform = 'scale(1)';
          scaleHandle.style.background = '#4f46e5';
        }
      });
    }
    emojiElement.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const customEvent = new CustomEvent('emojiDoubleClick', {
        detail: { emojiId: element.id }
      });
      this.container.dispatchEvent(customEvent);
    });
  }

  private startScaling(element: EmojiElement, e: MouseEvent) {
    console.log('开始缩放 Emoji:', element.id);
    e.stopPropagation();
    element.isScaling = true;
    const startFontSize = element.drawing.properties?.fontSize as number || 24;
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    if (element.scaleHandle) {
      element.scaleHandle.style.transform = 'scale(1.3)';
      element.scaleHandle.style.background = '#4338ca';
    }
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!element.isScaling) return;
      const deltaX = moveEvent.clientX - startClientX;
      const deltaY = moveEvent.clientY - startClientY;
      const scaleDelta = (deltaX + deltaY) * 0.3;
      const newFontSize = Math.max(12, Math.min(96, startFontSize + scaleDelta));
      this.updateEmojiSize(element, newFontSize);
      const scaleEvent = new CustomEvent('emojiScaling', {
        detail: {
          emojiId: element.id,
          fontSize: newFontSize,
          position: element.position
        },
        bubbles: true
      });
      this.container.dispatchEvent(scaleEvent);
    };

    const onMouseUp = () => {
      element.isScaling = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (element.scaleHandle) {
        element.scaleHandle.style.transform = 'scale(1)';
        element.scaleHandle.style.background = '#4f46e5';
      }
      console.log('结束缩放 Emoji:', element.id);
      const endEvent = new CustomEvent('emojiScaleEnd', {
        detail: {
          emojiId: element.id,
          drawing: element.drawing
        },
        bubbles: true
      });
      this.container.dispatchEvent(endEvent);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  private startDragging(element: EmojiElement, e: MouseEvent) {
    element.isDragging = true;
    const containerRect = this.container.getBoundingClientRect();
    const elementRect = element.element.getBoundingClientRect();
    element.dragStart = {
      x: e.clientX - elementRect.left,
      y: e.clientY - elementRect.top
    };
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!element.isDragging) return;
      const newX = moveEvent.clientX - containerRect.left - element.dragStart.x;
      const newY = moveEvent.clientY - containerRect.top - element.dragStart.y;
      const fontSize = element.drawing.properties?.fontSize as number || 24;
      const maxX = containerRect.width - fontSize;
      const maxY = containerRect.height - fontSize;
      const clampedX = Math.max(0, Math.min(maxX, newX));
      const clampedY = Math.max(0, Math.min(maxY, newY));
      this.updateEmojiPositionImmediately(element, { x: clampedX, y: clampedY });
      const updateEvent = new CustomEvent('emojiDragging', {
        detail: {
          emojiId: element.id,
          position: {
            x: clampedX + fontSize / 2,
            y: clampedY + fontSize / 2
          }
        },
        bubbles: true
      });
      this.container.dispatchEvent(updateEvent);
    };
    const onMouseUp = () => {
      element.isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      console.log('结束拖动 Emoji:', element.id);

      const endEvent = new CustomEvent('emojiDragEnd', {
        detail: {
          emojiId: element.id,
          drawing: element.drawing
        },
        bubbles: true
      });
      this.container.dispatchEvent(endEvent);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  private updateEmojiSize(element: EmojiElement, fontSize: number) {
    const currentFontSize = element.drawing.properties?.fontSize as number || 24;
    const originalCenter = {
      x: element.position.x + currentFontSize / 2,
      y: element.position.y + currentFontSize / 2
    };
    element.drawing.properties = {
      ...element.drawing.properties,
      fontSize: fontSize
    };
    const newPosition = {
      x: originalCenter.x - fontSize / 2,
      y: originalCenter.y - fontSize / 2
    };
    element.emojiElement.style.fontSize = `${fontSize}px`;
    element.emojiElement.style.width = `${fontSize}px`;
    element.emojiElement.style.height = `${fontSize}px`;
    element.element.style.left = `${newPosition.x}px`;
    element.element.style.top = `${newPosition.y}px`;
    element.element.style.width = `${fontSize}px`;
    element.element.style.height = `${fontSize}px`;
    element.position = newPosition;
    this.updateScaleHandlePosition(element);
    if (element.drawing.points.length > 0) {
      element.drawing.points[0] = {
        x: originalCenter.x,
        y: originalCenter.y
      };
    }
  }

  private updateEmojiPositionImmediately(element: EmojiElement, position: Point) {
    element.position = position;
    element.element.style.left = `${position.x}px`;
    element.element.style.top = `${position.y}px`;
    const fontSize = element.drawing.properties?.fontSize as number || 24;
    if (element.drawing.points.length > 0) {
      element.drawing.points[0] = {
        x: position.x + fontSize / 2,
        y: position.y + fontSize / 2
      };
    }
  }

  public updateEmojiPosition(element: EmojiElement, position: Point) {
    this.updateEmojiPositionImmediately(element, position);
  }

  public removeEmoji(drawingId: string): void {
    const emojiElement = this.emojiElements.get(drawingId);
    if (emojiElement) {
      emojiElement.element.remove();
      this.emojiElements.delete(drawingId);
    }
  }

  public getEmojiElement(id: string): EmojiElement | undefined {
    return this.emojiElements.get(id);
  }

  public getAllEmojiElements(): EmojiElement[] {
    return Array.from(this.emojiElements.values());
  }

  public showScaleHandle(emojiId: string) {
    const element = this.emojiElements.get(emojiId);
    if (element && element.scaleHandle) {
      element.scaleHandle.style.display = 'block';
    }
  }

  public hideScaleHandle(emojiId: string) {
    const element = this.emojiElements.get(emojiId);
    if (element && element.scaleHandle) {
      element.scaleHandle.style.display = 'none';
    }
  }

  public hideAllScaleHandles() {
    this.emojiElements.forEach(element => {
      if (element.scaleHandle) {
        element.scaleHandle.style.display = 'none';
      }
    });
  }

  public clearAll(): void {
    this.emojiElements.forEach((element) => {
      element.element.remove();
    });
    this.emojiElements.clear();
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.emojiElements.forEach(element => {
      element.element.style.pointerEvents = enabled ? 'auto' : 'none';
      if (element.scaleHandle) {
        element.scaleHandle.style.pointerEvents = enabled ? 'auto' : 'none';
      }
    });
  }

  public renderAllEmojis(drawings: Drawing[]) {
    this.clearAll();
    drawings.filter(d => d.type === 'emoji').forEach(drawing => {
      this.updateEmoji(drawing);
    });
  }

  public destroy() {
    this.clearAll();
  }
}