import { MarkType } from "../../types";
import { IGraph } from "../IGraph";
import { IMarkStyle } from "../IMarkStyle";

export interface TableCell {
  row: number;
  col: number;
  content: string;
  isSelected?: boolean; 
}

export interface TableStyle {
  borderColor: string;
  borderWidth: number;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
}

export class TableMark implements IGraph, IMarkStyle {
  private _chart: any;
  private _series: any;
  private _renderer: any;
  private _isPreview: boolean;
  private _isDragging: boolean = false;
  private _dragPoint: 'table' | 'corner' | null = null;
  private _showHandles: boolean = false;
  private markType: MarkType = MarkType.Table;
  private _startTime: string;
  private _startPrice: number;
  private _endTime: string;
  private _endPrice: number;
  private _rows: number = 3;
  private _cols: number = 3;
  private _cells: TableCell[][] = [];
  private _borderColor: string = '#CCCCCC';
  private _borderWidth: number = 1;
  private _backgroundColor: string = '#FFFFFF';
  private _textColor: string = '#333333';
  private _fontSize: number = 12;
  private _fontFamily: string = 'Arial, sans-serif';
  
  
  private _selectedCell: { row: number; col: number } | null = null;
  private _isTableSelected: boolean = false;
  private _editingCell: { row: number; col: number } | null = null;
  private _editInput: HTMLInputElement | null = null;

  constructor(
    startTime: string,
    startPrice: number,
    endTime: string,
    endPrice: number,
    rows: number = 3,
    cols: number = 3,
    isPreview: boolean = false
  ) {
    this._startTime = startTime;
    this._startPrice = startPrice;
    this._endTime = endTime;
    this._endPrice = endPrice;
    this._rows = rows;
    this._cols = cols;
    this._isPreview = isPreview;
    this.initializeCells();
  }
  
  updateColor(color: string): void {
    throw new Error("Method not implemented.");
  }
  
  updateLineWidth(lineWidth: number): void {
    throw new Error("Method not implemented.");
  }
  
  updateLineStyle(lineStyle: "solid" | "dashed" | "dotted"): void {
    throw new Error("Method not implemented.");
  }

  private initializeCells() {
    this._cells = [];
    for (let row = 0; row < this._rows; row++) {
      const rowCells: TableCell[] = [];
      for (let col = 0; col < this._cols; col++) {
        rowCells.push({
          row,
          col,
          content: `R${row + 1}C${col + 1}`,
          isSelected: false
        });
      }
      this._cells.push(rowCells);
    }
  }

  
  setTableSelected(selected: boolean) {
    this._isTableSelected = selected;
    if (!selected) {
      this.clearCellSelection();
    }
    this.requestUpdate();
  }

  
  selectCell(row: number, col: number) {
    
    this.clearCellSelection();
    
    
    if (row >= 0 && row < this._rows && col >= 0 && col < this._cols) {
      this._selectedCell = { row, col };
      if (this._cells[row] && this._cells[row][col]) {
        this._cells[row][col].isSelected = true;
      }
      this._isTableSelected = true;
      this.requestUpdate();
      return true;
    }
    return false;
  }

  
  clearCellSelection() {
    if (this._selectedCell) {
      const { row, col } = this._selectedCell;
      if (this._cells[row] && this._cells[row][col]) {
        this._cells[row][col].isSelected = false;
      }
      this._selectedCell = null;
    }
    this.requestUpdate();
  }

  
  startEditingCell(row: number, col: number) {
    if (this.selectCell(row, col)) {
      this._editingCell = { row, col };
      this.createEditInput();
    }
  }

  
  finishEditingCell() {
    if (this._editingCell && this._editInput) {
      const { row, col } = this._editingCell;
      const newContent = this._editInput.value;
      this.updateCellContent(row, col, newContent);
      this.removeEditInput();
      this._editingCell = null;
    }
  }

  
  cancelEditingCell() {
    this.removeEditInput();
    this._editingCell = null;
    this.requestUpdate();
  }

  
  private createEditInput() {
    if (!this._chart || !this._series) return;

    const bounds = this.getBounds();
    if (!bounds) return;

    const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
    const startY = this._series.priceToCoordinate(this._startPrice);
    const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
    const endY = this._series.priceToCoordinate(this._endPrice);
    if (startX == null || startY == null || endX == null || endY == null) return;

    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    const tableWidth = maxX - minX;
    const tableHeight = maxY - minY;
    const colWidth = tableWidth / this._cols;
    const rowHeight = tableHeight / this._rows;

    if (!this._editingCell) return;

    const { row, col } = this._editingCell;
    const cellX = minX + col * colWidth;
    const cellY = minY + row * rowHeight;

    
    this._editInput = document.createElement('input');
    this._editInput.type = 'text';
    this._editInput.value = this._cells[row][col].content;
    this._editInput.style.position = 'absolute';
    this._editInput.style.left = `${cellX + 2}px`;
    this._editInput.style.top = `${cellY + 2}px`;
    this._editInput.style.width = `${colWidth - 4}px`;
    this._editInput.style.height = `${rowHeight - 4}px`;
    this._editInput.style.border = '1px solid #007bff';
    this._editInput.style.background = '#fff';
    this._editInput.style.fontSize = `${this._fontSize}px`;
    this._editInput.style.fontFamily = this._fontFamily;
    this._editInput.style.padding = '2px';
    this._editInput.style.boxSizing = 'border-box';
    this._editInput.style.zIndex = '1000';

    
    this._editInput.addEventListener('blur', () => this.finishEditingCell());
    this._editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.finishEditingCell();
      } else if (e.key === 'Escape') {
        this.cancelEditingCell();
      }
    });

    
    const chartElement = this._chart.chartElement();
    if (chartElement) {
      chartElement.appendChild(this._editInput);
      this._editInput.focus();
      this._editInput.select();
    }
  }

  
  private removeEditInput() {
    if (this._editInput && this._editInput.parentNode) {
      this._editInput.parentNode.removeChild(this._editInput);
      this._editInput = null;
    }
  }

  
  getSelectedCell() {
    return this._selectedCell;
  }

  
  isPointInCell(x: number, y: number): { row: number; col: number } | null {
    if (!this._chart || !this._series) return null;

    const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
    const startY = this._series.priceToCoordinate(this._startPrice);
    const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
    const endY = this._series.priceToCoordinate(this._endPrice);
    if (startX == null || startY == null || endX == null || endY == null) return null;

    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    const tableWidth = maxX - minX;
    const tableHeight = maxY - minY;
    const colWidth = tableWidth / this._cols;
    const rowHeight = tableHeight / this._rows;

    
    if (x < minX || x > maxX || y < minY || y > maxY) return null;

    
    const col = Math.floor((x - minX) / colWidth);
    const row = Math.floor((y - minY) / rowHeight);

    if (row >= 0 && row < this._rows && col >= 0 && col < this._cols) {
      return { row, col };
    }

    return null;
  }

  getMarkType(): MarkType {
    return this.markType;
  }

  attached(param: any) {
    this._chart = param.chart;
    this._series = param.series;
    this.requestUpdate();
  }

  updateAllViews() { }

  updatePosition(startTime: string, startPrice: number, endTime: string, endPrice: number) {
    this._startTime = startTime;
    this._startPrice = startPrice;
    this._endTime = endTime;
    this._endPrice = endPrice;
    this.requestUpdate();
  }

  addRow(position: 'top' | 'bottom' = 'bottom') {
    if (position === 'bottom') {
      const newRow: TableCell[] = [];
      for (let col = 0; col < this._cols; col++) {
        newRow.push({
          row: this._rows,
          col,
          content: `R${this._rows + 1}C${col + 1}`,
          isSelected: false
        });
      }
      this._cells.push(newRow);
    } else {
      const newRow: TableCell[] = [];
      for (let col = 0; col < this._cols; col++) {
        newRow.push({
          row: 0,
          col,
          content: `R1C${col + 1}`,
          isSelected: false
        });
      }
      this._cells.unshift(newRow);
      for (let row = 1; row < this._cells.length; row++) {
        for (let col = 0; col < this._cols; col++) {
          this._cells[row][col].row = row;
          this._cells[row][col].content = `R${row + 1}C${col + 1}`;
        }
      }
    }
    this._rows++;
    this.requestUpdate();
  }

  addColumn(position: 'left' | 'right' = 'right') {
    if (position === 'right') {
      for (let row = 0; row < this._rows; row++) {
        this._cells[row].push({
          row,
          col: this._cols,
          content: `R${row + 1}C${this._cols + 1}`,
          isSelected: false
        });
      }
    } else {
      for (let row = 0; row < this._rows; row++) {
        this._cells[row].unshift({
          row,
          col: 0,
          content: `R${row + 1}C1`,
          isSelected: false
        });
        for (let col = 1; col < this._cells[row].length; col++) {
          this._cells[row][col].col = col;
          this._cells[row][col].content = `R${row + 1}C${col + 1}`;
        }
      }
    }
    this._cols++;
    this.requestUpdate();
  }

  removeRow(rowIndex: number) {
    if (this._rows <= 1) return;
    this._cells.splice(rowIndex, 1);
    this._rows--;
    for (let row = rowIndex; row < this._rows; row++) {
      for (let col = 0; col < this._cols; col++) {
        this._cells[row][col].row = row;
        this._cells[row][col].content = `R${row + 1}C${col + 1}`;
      }
    }
    this.requestUpdate();
  }

  removeColumn(colIndex: number) {
    if (this._cols <= 1) return;
    for (let row = 0; row < this._rows; row++) {
      this._cells[row].splice(colIndex, 1);
      for (let col = colIndex; col < this._cols - 1; col++) {
        this._cells[row][col].col = col;
        this._cells[row][col].content = `R${row + 1}C${col + 1}`;
      }
    }
    this._cols--;
    this.requestUpdate();
  }

  updateCellContent(row: number, col: number, content: string) {
    if (row >= 0 && row < this._rows && col >= 0 && col < this._cols) {
      this._cells[row][col].content = content;
      this.requestUpdate();
    }
  }

  setPreviewMode(isPreview: boolean) {
    this._isPreview = isPreview;
    this.requestUpdate();
  }

  setDragging(isDragging: boolean, dragPoint: 'table' | 'corner' | null = null) {
    this._isDragging = isDragging;
    this._dragPoint = dragPoint;
    this.requestUpdate();
  }

  setShowHandles(show: boolean) {
    this._showHandles = show;
    this.requestUpdate();
  }

  dragTableByPixels(deltaX: number, deltaY: number) {
    if (isNaN(deltaX) || isNaN(deltaY)) return;
    if (!this._chart || !this._series) return;
    const timeScale = this._chart.timeScale();
    const startX = timeScale.timeToCoordinate(this._startTime);
    const startY = this._series.priceToCoordinate(this._startPrice);
    const endX = timeScale.timeToCoordinate(this._endTime);
    const endY = this._series.priceToCoordinate(this._endPrice);
    if (startX === null || startY === null || endX === null || endY === null) return;
    const newStartX = startX + deltaX;
    const newStartY = startY + deltaY;
    const newEndX = endX + deltaX;
    const newEndY = endY + deltaY;
    const newStartTime = timeScale.coordinateToTime(newStartX);
    const newStartPrice = this._series.coordinateToPrice(newStartY);
    const newEndTime = timeScale.coordinateToTime(newEndX);
    const newEndPrice = this._series.coordinateToPrice(newEndY);
    if (newStartTime !== null && !isNaN(newStartPrice) && newEndTime !== null && !isNaN(newEndPrice)) {
      this._startTime = newStartTime.toString();
      this._startPrice = newStartPrice;
      this._endTime = newEndTime.toString();
      this._endPrice = newEndPrice;
      this.requestUpdate();
    }
  }

  resizeTableByCorner(cornerType: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right', newTime: string, newPrice: number) {
    switch (cornerType) {
      case 'top-left':
        this._startTime = newTime;
        this._startPrice = newPrice;
        break;
      case 'top-right':
        this._endTime = newTime;
        this._startPrice = newPrice;
        break;
      case 'bottom-left':
        this._startTime = newTime;
        this._endPrice = newPrice;
        break;
      case 'bottom-right':
        this._endTime = newTime;
        this._endPrice = newPrice;
        break;
    }
    this.requestUpdate();
  }

  isPointNearTable(x: number, y: number, threshold: number = 15): 'table' | 'corner' | null {
    if (!this._chart || !this._series) return null;
    const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
    const startY = this._series.priceToCoordinate(this._startPrice);
    const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
    const endY = this._series.priceToCoordinate(this._endPrice);
    if (startX == null || startY == null || endX == null || endY == null) return null;
    const cornerThreshold = 8;
    const corners = [
      { x: startX, y: startY, name: 'top-left' },
      { x: endX, y: startY, name: 'top-right' },
      { x: startX, y: endY, name: 'bottom-left' },
      { x: endX, y: endY, name: 'bottom-right' }
    ];
    for (const corner of corners) {
      const distToCorner = Math.sqrt(Math.pow(x - corner.x, 2) + Math.pow(y - corner.y, 2));
      if (distToCorner <= cornerThreshold) {
        return 'corner';
      }
    }
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);
    if (x >= minX - threshold && x <= maxX + threshold &&
      y >= minY - threshold && y <= maxY + threshold) {
      return 'table';
    }
    return null;
  }

  private requestUpdate() {
    if (this._chart && this._series) {
      try {
        this._chart.timeScale().applyOptions({});
      } catch (error) {
        console.log('Apply options method not available');
      }
      if (this._series._internal__dataChanged) {
        this._series._internal__dataChanged();
      }
      if (this._chart._internal__paneUpdate) {
        this._chart._internal__paneUpdate();
      }
    }
  }

  time() {
    return this._startTime;
  }

  priceValue() {
    return this._startPrice;
  }

  paneViews() {
    if (!this._renderer) {
      this._renderer = {
        draw: (target: any) => {
          const ctx = target.context ?? target._context;
          if (!ctx || !this._chart || !this._series) return;
          const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
          const startY = this._series.priceToCoordinate(this._startPrice);
          const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
          const endY = this._series.priceToCoordinate(this._endPrice);
          if (startX == null || startY == null || endX == null || endY == null) return;
          const minX = Math.min(startX, endX);
          const maxX = Math.max(startX, endX);
          const minY = Math.min(startY, endY);
          const maxY = Math.max(startY, endY);
          const tableWidth = maxX - minX;
          const tableHeight = maxY - minY;
          ctx.save();
          ctx.fillStyle = this._backgroundColor;
          ctx.fillRect(minX, minY, tableWidth, tableHeight);
          ctx.strokeStyle = this._borderColor;
          ctx.lineWidth = this._borderWidth;
          ctx.setLineDash([]);
          if (this._isPreview || this._isDragging) {
            ctx.globalAlpha = 0.7;
          } else {
            ctx.globalAlpha = 1.0;
          }
          ctx.strokeRect(minX, minY, tableWidth, tableHeight);
          const rowHeight = tableHeight / this._rows;
          for (let i = 1; i < this._rows; i++) {
            const y = minY + i * rowHeight;
            ctx.beginPath();
            ctx.moveTo(minX, y);
            ctx.lineTo(maxX, y);
            ctx.stroke();
          }
          const colWidth = tableWidth / this._cols;
          for (let i = 1; i < this._cols; i++) {
            const x = minX + i * colWidth;
            ctx.beginPath();
            ctx.moveTo(x, minY);
            ctx.lineTo(x, maxY);
            ctx.stroke();
          }
          
          
          ctx.fillStyle = this._textColor;
          ctx.font = `${this._fontSize}px ${this._fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
              const cellX = minX + col * colWidth;
              const cellY = minY + row * rowHeight;
              const cell = this._cells[row]?.[col];
              
              
              if (cell?.isSelected) {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 123, 255, 0.3)'; 
                ctx.fillRect(cellX + 1, cellY + 1, colWidth - 2, rowHeight - 2);
                ctx.restore();
              }
              
              if (cell) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(
                  minX + col * colWidth + 2,
                  minY + row * rowHeight + 2,
                  colWidth - 4,
                  rowHeight - 4
                );
                ctx.clip();
                ctx.fillText(cell.content, cellX + colWidth / 2, cellY + rowHeight / 2);
                ctx.restore();
              }
            }
          }
          
          if ((this._showHandles || this._isDragging) && !this._isPreview) {
            const corners = [
              { x: minX, y: minY },
              { x: maxX, y: minY },
              { x: minX, y: maxY },
              { x: maxX, y: maxY }
            ];
            corners.forEach(corner => {
              ctx.fillStyle = this._borderColor;
              ctx.beginPath();
              ctx.arc(corner.x, corner.y, 6, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.arc(corner.x, corner.y, 4, 0, Math.PI * 2);
              ctx.fill();
              if (this._dragPoint === 'corner') {
                ctx.strokeStyle = this._borderColor;
                ctx.lineWidth = 1;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.arc(corner.x, corner.y, 8, 0, Math.PI * 2);
                ctx.stroke();
              }
            });
          }
          ctx.restore();
        },
      };
    }
    return [{ renderer: () => this._renderer }];
  }

  getTableInfo() {
    return {
      startTime: this._startTime,
      startPrice: this._startPrice,
      endTime: this._endTime,
      endPrice: this._endPrice,
      rows: this._rows,
      cols: this._cols,
      cells: this._cells
    };
  }

  updateBorderColor(color: string) {
    this._borderColor = color;
    this.requestUpdate();
  }

  updateBorderWidth(width: number) {
    this._borderWidth = width;
    this.requestUpdate();
  }

  updateBackgroundColor(color: string) {
    this._backgroundColor = color;
    this.requestUpdate();
  }

  updateTextColor(color: string) {
    this._textColor = color;
    this.requestUpdate();
  }

  updateFontSize(size: number) {
    this._fontSize = size;
    this.requestUpdate();
  }

  updateFontFamily(fontFamily: string) {
    this._fontFamily = fontFamily;
    this.requestUpdate();
  }

  public updateStyles(styles: Partial<TableStyle>): void {
    if (styles.borderColor) this.updateBorderColor(styles.borderColor);
    if (styles.borderWidth) this.updateBorderWidth(styles.borderWidth);
    if (styles.backgroundColor) this.updateBackgroundColor(styles.backgroundColor);
    if (styles.textColor) this.updateTextColor(styles.textColor);
    if (styles.fontSize) this.updateFontSize(styles.fontSize);
    if (styles.fontFamily) this.updateFontFamily(styles.fontFamily);
    this.requestUpdate();
  }

  public getCurrentStyles(): TableStyle {
    return {
      borderColor: this._borderColor,
      borderWidth: this._borderWidth,
      backgroundColor: this._backgroundColor,
      textColor: this._textColor,
      fontSize: this._fontSize,
      fontFamily: this._fontFamily,
    };
  }

  getBounds() {
    if (!this._chart || !this._series) return null;
    const startX = this._chart.timeScale().timeToCoordinate(this._startTime);
    const startY = this._series.priceToCoordinate(this._startPrice);
    const endX = this._chart.timeScale().timeToCoordinate(this._endTime);
    const endY = this._series.priceToCoordinate(this._endPrice);
    if (startX == null || startY == null || endX == null || endY == null) return null;
    return {
      startX, startY, endX, endY,
      minX: Math.min(startX, endX),
      maxX: Math.max(startX, endX),
      minY: Math.min(startY, endY),
      maxY: Math.max(startY, endY)
    };
  }
  
  destroy() {
    this.removeEditInput();
  }
}