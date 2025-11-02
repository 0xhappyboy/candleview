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
  isSelected: boolean; // 新增选择状态
}

export class TextManager {
  private textElements: Map<string, TextElement> = new Map();
  private container: HTMLElement;
  private theme: ThemeConfig;
  private isEnabled: boolean = true;
  // 在 TextManager 类中添加选择状态管理
  private selectedTextId: string | null = null;
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
      resizeStartSize: fontSize,
      isSelected: false
    };

    this.textElements.set(drawing.id, element);
    this.setupEventListeners(element);

    return element;
  }



  // 修改事件监听器
  private setupEventListeners(element: TextElement) {
    const { element: el } = element;

    // 鼠标进入显示手柄
    el.addEventListener('mouseenter', (e) => {
      e.stopPropagation();
      const handle = el.querySelector('.text-resize-handle') as HTMLElement;
      if (handle) handle.style.opacity = '1';
    });

    // 鼠标离开隐藏手柄（非选中状态）
    el.addEventListener('mouseleave', (e) => {
      e.stopPropagation();
      const handle = el.querySelector('.text-resize-handle') as HTMLElement;
      if (handle && !element.isSelected && !element.isDragging && !element.isResizing) {
        handle.style.opacity = '0';
      }
    });

    // 单击选择文字
    el.addEventListener('mousedown', (e) => {
      if (!this.isEnabled) return;

      const target = e.target as HTMLElement;

      // 处理调整大小手柄
      if (target.classList.contains('text-resize-handle')) {
        e.stopPropagation();
        e.preventDefault();
        this.startResizing(element, e);
        return;
      }

      // 选择文字
      e.stopPropagation();
      e.preventDefault();

      // 设置选中状态
      this.setSelected(element.id, true);

      // 开始拖动
      this.startDragging(element, e);
    });

    // 双击编辑
    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      e.preventDefault();

      // 设置选中状态
      this.setSelected(element.id, true);

      // 触发双击编辑事件
      const event = new CustomEvent('textDoubleClick', {
        detail: {
          textId: element.id,
          text: element.drawing.properties?.text || '',
          position: element.position
        }
      });
      this.container.dispatchEvent(event);
    });
  }



  // 新增选择状态管理
  // 设置文字选中状态
  public setSelected(textId: string, selected: boolean): void {
    const element = this.textElements.get(textId);
    if (!element) return;

    if (selected) {
      // 清除之前的选择
      this.clearSelection();

      // 设置新的选择
      this.selectedTextId = textId;
      element.isSelected = true;

      // 显示边框和手柄
      element.element.style.border = `2px solid ${this.theme.chart.lineColor}`;
      const handle = element.element.querySelector('.text-resize-handle') as HTMLElement;
      if (handle) handle.style.opacity = '1';

      // 通知主系统选择了文字
      if (this.onTextClick) {
        this.onTextClick('text');
      }

      // 通知主系统更新 selectedDrawing
      const selectEvent = new CustomEvent('textSelectedForDrawing', {
        detail: {
          textId: textId,
          drawing: element.drawing
        }
      });
      this.container.dispatchEvent(selectEvent);

    } else {
      element.isSelected = false;
      element.element.style.border = 'none';
      const handle = element.element.querySelector('.text-resize-handle') as HTMLElement;
      if (handle && !element.isDragging && !element.isResizing) {
        handle.style.opacity = '0';
      }

      if (this.selectedTextId === textId) {
        this.selectedTextId = null;
      }
    }
  }


  // 清除所有选择
  // 清除所有选择
  public clearSelection(): void {
    this.textElements.forEach(element => {
      element.isSelected = false;
      element.element.style.border = 'none';
      const handle = element.element.querySelector('.text-resize-handle') as HTMLElement;
      if (handle && !element.isDragging && !element.isResizing) {
        handle.style.opacity = '0';
      }
    });
    this.selectedTextId = null;
  }

  // 获取当前选中的文字
  public getSelectedText(): TextElement | null {
    if (this.selectedTextId) {
      return this.textElements.get(this.selectedTextId) || null;
    }
    return null;
  }

  private startDragging(element: TextElement, e: MouseEvent) {
    element.isDragging = true;

    // 阻止事件冒泡，避免被 Canvas 层处理
    e.stopPropagation();
    e.preventDefault();

    const rect = element.element.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    element.dragStart = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!element.isDragging) return;

      // 阻止事件冒泡
      moveEvent.stopPropagation();
      moveEvent.preventDefault();

      const containerRect = this.container.getBoundingClientRect();
      let newX = moveEvent.clientX - containerRect.left - element.dragStart.x;
      let newY = moveEvent.clientY - containerRect.top - element.dragStart.y;

      // 边界检查
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

      // 通知位置更新
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