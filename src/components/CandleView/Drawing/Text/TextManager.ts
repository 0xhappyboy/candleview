import { ThemeConfig } from "../../CandleViewTheme";
import { Drawing, Point } from "../types";


export interface TextElement {
  id: string;
  element: HTMLDivElement;
  drawing: Drawing;
  position: Point;
  isDragging: boolean;
  isResizing: boolean;
  dragStart: Point;
  resizeStart: Point;
  resizeStartSize: number;
}

export class TextManager {
  private textElements: Map<string, TextElement> = new Map();
  private container: HTMLElement;
  private theme: ThemeConfig;
  private isEnabled: boolean = true;

  private onTextClick?: (toolId: string) => void;

  constructor(
    container: HTMLElement,
    theme: ThemeConfig,
    onTextClick?: (toolId: string) => void
  ) {
    this.container = container;
    this.theme = theme;
    this.onTextClick = onTextClick;
    this.setupContainer();
  }

  private setupContainer() {
    if (this.container.style.position !== 'absolute' &&
      this.container.style.position !== 'relative') {
      this.container.style.position = 'relative';
    }
    this.container.style.overflow = 'visible';
  }

  createText(drawing: Drawing): TextElement {
    if (this.textElements.has(drawing.id)) {
      this.removeText(drawing.id);
    }

    const textElement = document.createElement('div');
    textElement.className = 'drawing-text-element';
    textElement.setAttribute('data-text-id', drawing.id);
    textElement.contentEditable = 'false';

    const fontSize = drawing.properties?.fontSize || 14;

    textElement.style.cssText = `
      position: absolute;
      left: ${drawing.points[0].x}px;
      top: ${drawing.points[0].y}px;
      color: ${drawing.color};
      font-size: ${fontSize}px;
      font-family: ${drawing.properties?.fontFamily || 'Arial, sans-serif'};
      font-weight: ${drawing.properties?.isBold ? 'bold' : 'normal'};
      font-style: ${drawing.properties?.isItalic ? 'italic' : 'normal'};
      background: transparent;
      border: none;
      padding: 2px 6px;
      margin: 0;
      cursor: move;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      white-space: nowrap;
      z-index: 100;
      min-width: 20px;
      min-height: 20px;
      display: flex;
      align-items: center;
      pointer-events: auto;
      transform-origin: center center;
    `;

    textElement.textContent = drawing.properties?.text || '';

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'text-resize-handle';
    resizeHandle.style.cssText = `
      position: absolute;
      right: -6px;
      bottom: -6px;
      width: 12px;
      height: 12px;
      background: ${this.theme.chart.lineColor};
      border: 1px solid ${this.theme.toolbar.background};
      border-radius: 2px;
      cursor: nwse-resize;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 101;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
    `;

    textElement.appendChild(resizeHandle);
    this.container.appendChild(textElement);

    const element: TextElement = {
      id: drawing.id,
      element: textElement,
      drawing,
      position: drawing.points[0],
      isDragging: false,
      isResizing: false,
      dragStart: { x: 0, y: 0 },
      resizeStart: { x: 0, y: 0 },
      resizeStartSize: fontSize
    };

    this.textElements.set(drawing.id, element);
    this.setupEventListeners(element);

    return element;
  }



  private setupEventListeners(element: TextElement) {
    const { element: el } = element;

    el.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      const handle = el.querySelector('.text-resize-handle') as HTMLElement;
      if (handle) handle.style.opacity = '1';
    });

    el.addEventListener('mouseleave', (e) => {
      e.stopPropagation();
      const handle = el.querySelector('.text-resize-handle') as HTMLElement;
      if (handle && !element.isDragging && !element.isResizing) {
        handle.style.opacity = '0';
      }
    });


    el.addEventListener('mousedown', (e) => {
      if (!this.isEnabled) return;
      const target = e.target as HTMLElement;
      if (target.classList.contains('text-resize-handle')) {
        e.stopPropagation();
        e.preventDefault();
        this.startResizing(element, e);
        return;
      }
      if (this.onTextClick) {
        this.onTextClick('text');
      }
    });


    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const event = new CustomEvent('textDoubleClick', {
        detail: { textId: element.id }
      });
      this.container.dispatchEvent(event);
    });
  }

  private startDragging(element: TextElement, e: MouseEvent) {
    element.isDragging = true;
    const rect = element.element.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    element.dragStart = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!element.isDragging) return;

      const containerRect = this.container.getBoundingClientRect();
      let newX = moveEvent.clientX - containerRect.left - element.dragStart.x;
      let newY = moveEvent.clientY - containerRect.top - element.dragStart.y;


      const textRect = element.element.getBoundingClientRect();
      const maxX = containerRect.width - textRect.width;
      const maxY = containerRect.height - textRect.height;

      newX = Math.max(0, Math.min(maxX, newX));
      newY = Math.max(0, Math.min(maxY, newY));

      this.updateTextPosition(element, { x: newX, y: newY });
    };

    const onMouseUp = () => {
      element.isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      this.updateDrawingPosition(element);

      const event = new CustomEvent('textUpdated', {
        detail: { textId: element.id }
      });
      this.container.dispatchEvent(event);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }


  private startResizing(element: TextElement, e: MouseEvent) {
    element.isResizing = true;
    element.resizeStart = { x: e.clientX, y: e.clientY };
    element.resizeStartSize = parseFloat(element.element.style.fontSize) || 14;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!element.isResizing) return;


      const deltaY = moveEvent.clientY - element.resizeStart.y;



      const sizeChange = Math.round(deltaY / 10);
      const newSize = Math.max(8, Math.min(72, element.resizeStartSize + sizeChange));


      element.element.style.fontSize = `${newSize}px`;


      if (element.drawing.properties) {
        element.drawing.properties.fontSize = newSize;
      }
    };

    const onMouseUp = () => {
      element.isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const event = new CustomEvent('textUpdated', {
        detail: { textId: element.id }
      });
      this.container.dispatchEvent(event);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    e.stopPropagation();
  }


  updateTextPosition(element: TextElement, position: Point) {
    element.position = position;
    element.element.style.left = `${position.x}px`;
    element.element.style.top = `${position.y}px`;

    if (element.drawing.points.length > 0) {
      element.drawing.points[0] = { ...position };
    }
  }

  private updateDrawingPosition(element: TextElement) {
    if (element.drawing.points.length > 0) {
      element.drawing.points[0] = { ...element.position };
    }
  }

  updateText(element: TextElement, drawing: Drawing) {
    element.drawing = drawing;
    element.element.textContent = drawing.properties?.text || '';
    element.element.style.color = drawing.color;


    const fontSize = drawing.properties?.fontSize || 14;
    element.element.style.fontSize = `${fontSize}px`;

    element.element.style.fontWeight = drawing.properties?.isBold ? 'bold' : 'normal';
    element.element.style.fontStyle = drawing.properties?.isItalic ? 'italic' : 'normal';

    this.updateTextPosition(element, drawing.points[0]);
  }

  removeText(id: string) {
    const element = this.textElements.get(id);
    if (element) {
      element.element.remove();
      this.textElements.delete(id);
    }
  }

  getTextElement(id: string): TextElement | undefined {
    return this.textElements.get(id);
  }

  getAllTextElements(): TextElement[] {
    return Array.from(this.textElements.values());
  }

  clearAll() {
    this.textElements.forEach(element => {
      element.element.remove();
    });
    this.textElements.clear();
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.textElements.forEach(element => {
      element.element.style.pointerEvents = enabled ? 'auto' : 'none';
      const handle = element.element.querySelector('.text-resize-handle') as HTMLElement;
      if (handle) {
        handle.style.pointerEvents = enabled ? 'auto' : 'none';
      }
    });
  }

  renderAllTexts(drawings: Drawing[]) {
    this.clearAll();
    drawings.filter(d => d.type === 'text').forEach(drawing => {
      this.createText(drawing);
    });
  }

  destroy() {
    this.clearAll();
  }
}