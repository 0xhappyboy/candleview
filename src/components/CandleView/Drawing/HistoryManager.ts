import { Drawing, HistoryRecord } from '../types';

export class HistoryManager {
  private history: HistoryRecord[] = [];
  private historyIndex: number = -1;
  private readonly maxHistorySize: number;

  constructor(maxHistorySize: number = 50) {
    this.maxHistorySize = maxHistorySize;
  }

  saveState(drawings: Drawing[], description: string) {
    if (this.historyIndex < this.history.length - 1) {
      this.history.splice(this.historyIndex + 1);
    }

    const newRecord: HistoryRecord = {
      drawings: JSON.parse(JSON.stringify(drawings)),
      description
    };

    this.history.push(newRecord);

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    this.historyIndex = this.history.length - 1;
  }

  undo(): Drawing[] | null {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      return this.getCurrentState();
    }
    return null;
  }

  redo(): Drawing[] | null {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      return this.getCurrentState();
    }
    return null;
  }

  getCurrentState(): Drawing[] | null {
    if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
      return JSON.parse(JSON.stringify(this.history[this.historyIndex].drawings));
    }
    return null;
  }

  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  clear() {
    this.history = [];
    this.historyIndex = -1;
  }

  getHistoryIndex(): number {
    return this.historyIndex;
  }

  getHistory(): HistoryRecord[] {
    return this.history;
  }
}