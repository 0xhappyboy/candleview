import { Drawing, Point } from "../types";

export interface EmojiElement {
  id: string;
  element: HTMLDivElement;
  drawing: Drawing;
  position: Point;
  isDragging: boolean;
  dragStart: Point;
}

export class EmojiManager {
  private emojiElements: Map<string, EmojiElement> = new Map();
  private container: HTMLElement;
  private onEmojiClick?: (toolId: string) => void;
  private isEnabled: boolean = true;

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

      const element = document.createElement('div');
      element.className = 'drawing-emoji-element';
      element.setAttribute('data-emoji-id', id);

      element.style.cssText = `
        position: absolute;
        left: ${point.x - fontSize / 2}px;
        top: ${point.y - fontSize / 2}px;
        font-size: ${fontSize}px;
        line-height: 1;
        cursor: move;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        z-index: 100;
        pointer-events: auto;
        transform-origin: center center;
      `;

      element.textContent = emoji;

      this.container.appendChild(element);

      emojiElement = {
        id: drawing.id,
        element: element,
        drawing: { ...drawing },
        position: { x: point.x - fontSize / 2, y: point.y - fontSize / 2 },
        isDragging: false,
        dragStart: { x: 0, y: 0 }
      };

      this.emojiElements.set(id, emojiElement);
      this.setupEventListeners(emojiElement);
    } else {

      emojiElement.element.textContent = emoji;
      const newX = point.x - fontSize / 2;
      const newY = point.y - fontSize / 2;
      emojiElement.element.style.left = `${newX}px`;
      emojiElement.element.style.top = `${newY}px`;
      emojiElement.element.style.fontSize = `${fontSize}px`;
      emojiElement.drawing = { ...drawing };
      emojiElement.position = { x: newX, y: newY };
    }

    return emojiElement;
  }

  private setupEventListeners(element: EmojiElement) {
    const { element: el } = element;

    el.addEventListener('mousedown', (e) => {
      if (!this.isEnabled) return;

      e.stopPropagation();
      e.preventDefault();


      if (this.onEmojiClick) {
        console.log('调用 onEmojiClick 切换到 Emoji 模式');
        this.onEmojiClick('emoji');
      }


      this.startDragging(element, e);


      const customEvent = new CustomEvent('emojiSelected', {
        detail: { emojiId: element.id, originalEvent: e },
        bubbles: true
      });
      this.container.dispatchEvent(customEvent);
    });

    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const customEvent = new CustomEvent('emojiDoubleClick', {
        detail: { emojiId: element.id }
      });
      this.container.dispatchEvent(customEvent);
    });
  }

  private startDragging(element: EmojiElement, e: MouseEvent) {
    element.isDragging = true;

    const containerRect = this.container.getBoundingClientRect();
    const elementRect = element.element.getBoundingClientRect();


    element.dragStart = {
      x: e.clientX - elementRect.left,
      y: e.clientY - elementRect.top
    };

    console.log('开始拖动 Emoji:', element.id);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!element.isDragging) return;


      const newX = moveEvent.clientX - containerRect.left - element.dragStart.x;
      const newY = moveEvent.clientY - containerRect.top - element.dragStart.y;


      const emojiRect = element.element.getBoundingClientRect();
      const maxX = containerRect.width - emojiRect.width;
      const maxY = containerRect.height - emojiRect.height;

      const clampedX = Math.max(0, Math.min(maxX, newX));
      const clampedY = Math.max(0, Math.min(maxY, newY));


      this.updateEmojiPositionImmediately(element, { x: clampedX, y: clampedY });


      const updateEvent = new CustomEvent('emojiDragging', {
        detail: {
          emojiId: element.id,
          position: {
            x: clampedX + emojiRect.width / 2,
            y: clampedY + emojiRect.height / 2
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