import { ChartSeries } from "../../ChartLayer/ChartTypeManager";
import { IMarkManager } from "../../Mark/IMarkManager";
import { TimeEventConfig, TimeEventMark } from "../../Mark/Script/TimeEventMark";
import { Point } from "../../types";

export interface TimeEventMarkManagerProps {
  chartSeries: ChartSeries | null;
  chart: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onCloseDrawing?: () => void;
  defaultConfig?: Partial<TimeEventConfig>;
  onDoubleClick?: (id: string, time: number, script: string) => void;
}

export interface TimeEventMarkState {
  isTimeEventMode: boolean;
  isDragging: boolean;
  dragTarget: TimeEventMark | null;
  previewMark: TimeEventMark | null;
}

export class TimeEventMarkManager implements IMarkManager<TimeEventMark> {
  private props: TimeEventMarkManagerProps;
  private state: TimeEventMarkState;
  private timeEventMarks: TimeEventMark[] = [];
  private timeToMarkMap: Map<number, TimeEventMark> = new Map();
  private timeToScriptMap: Map<number, string> = new Map();
  private idToMarkMap: Map<string, TimeEventMark> = new Map();
  private idToScriptMap: Map<string, string> = new Map();
  private dragStartData: { time: number; coordinate: number } | null = null;
  private isOperating: boolean = false;
  private lastClickTime: number = 0;
  private lastClickMark: TimeEventMark | null = null;

  constructor(props: TimeEventMarkManagerProps) {
    this.props = props;
    this.state = {
      isTimeEventMode: false,
      isDragging: false,
      dragTarget: null,
      previewMark: null
    };
  }

  public clearState(): void {
    this.state = {
      isTimeEventMode: false,
      isDragging: false,
      dragTarget: null,
      previewMark: null
    };
  }

  public getMarkAtPoint(point: Point): TimeEventMark | null {
    const { chartSeries, chart, containerRef } = this.props;
    if (!chartSeries || !chart) return null;
    try {
      const chartElement = chart.chartElement();
      if (!chartElement) return null;
      const chartRect = chartElement.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return null;
      const relativeX = point.x - (containerRect.left - chartRect.left);
      const relativeY = point.y - (containerRect.top - chartRect.top);
      for (const mark of this.timeEventMarks) {
        if (mark.isPointNear(relativeX, relativeY)) {
          return mark;
        }
      }
    } catch (error) {
    }
    return null;
  }

  public getMarkByTime(time: number): TimeEventMark | null {
    return this.timeToMarkMap.get(time) || null;
  }

  public getCurrentDragTarget(): TimeEventMark | null {
    return this.state.dragTarget;
  }

  public getCurrentDragPoint(): string | null {
    return this.state.dragTarget ? 'bubble' : null;
  }

  public getCurrentOperatingMark(): TimeEventMark | null {
    if (this.state.dragTarget) {
      return this.state.dragTarget;
    }
    if (this.state.previewMark) {
      return this.state.previewMark;
    }
    return null;
  }

  public getAllMarks(): TimeEventMark[] {
    return [...this.timeEventMarks];
  }

  public cancelOperationMode() {
    return this.cancelTimeEventMode();
  }

  public setTimeEventMode = (): TimeEventMarkState => {
    this.state = {
      ...this.state,
      isTimeEventMode: true,
      previewMark: null
    };
    return this.state;
  };

  public cancelTimeEventMode = (): TimeEventMarkState => {
    if (this.state.previewMark) {
      const id = this.state.previewMark.id();
      const time = this.state.previewMark.time();
      this.props.chartSeries?.series.detachPrimitive(this.state.previewMark);
      this.timeToScriptMap.delete(time);
      this.idToScriptMap.delete(id);
    }
    this.timeEventMarks.forEach(mark => {
      mark.setShowHandles(false);
    });
    this.state = {
      isTimeEventMode: false,
      isDragging: false,
      dragTarget: null,
      previewMark: null
    };
    this.isOperating = false;
    return this.state;
  };

  public handleMouseDown = (point: Point): TimeEventMarkState => {
    const { chartSeries, chart, containerRef, defaultConfig } = this.props;
    if (!chartSeries || !chart) return this.state;
    try {
      const chartElement = chart.chartElement();
      if (!chartElement) return this.state;
      const chartRect = chartElement.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return this.state;
      const relativeX = point.x - (containerRect.left - chartRect.left);
      const relativeY = point.y - (containerRect.top - chartRect.top);
      const timeScale = chart.timeScale();
      const time = timeScale.coordinateToTime(relativeX);
      if (time === null) return this.state;
      const clickedMark = this.getMarkAtPoint(point);
      const currentTime = Date.now();
      const isDoubleClick =
        clickedMark &&
        clickedMark === this.lastClickMark &&
        currentTime - this.lastClickTime < 300;
      if (isDoubleClick && this.props.onDoubleClick) {
        this.props.onDoubleClick(clickedMark.id(), clickedMark.time(), this.idToScriptMap.get(clickedMark.id()) || '');
        this.lastClickTime = 0;
        this.lastClickMark = null;
        if (this.state.isTimeEventMode) {
          return this.cancelTimeEventMode();
        }
        return this.state;
      }
      this.lastClickMark = clickedMark;
      this.lastClickTime = currentTime;
      if (clickedMark) {
        this.state = {
          ...this.state,
          isDragging: true,
          dragTarget: clickedMark,
          isTimeEventMode: false
        };
        this.timeEventMarks.forEach(m => {
          m.setShowHandles(m === clickedMark);
        });
        this.dragStartData = { time, coordinate: relativeX };
        this.isOperating = true;
        clickedMark.setDragging(true);
        return this.state;
      }
      if (this.state.isTimeEventMode) {
        if (!this.state.previewMark) {
          const defaultTitle = defaultConfig?.title || 'Event';
          const config: TimeEventConfig = {
            time,
            title: defaultTitle,
            description: defaultConfig?.description || '',
            color: defaultConfig?.color || '#007c15ff',
            backgroundColor: defaultConfig?.backgroundColor || '#FFFFFF',
            textColor: defaultConfig?.textColor || '#333333',
            fontSize: defaultConfig?.fontSize || 12,
            padding: defaultConfig?.padding || 8,
            arrowHeight: defaultConfig?.arrowHeight || 6,
            borderRadius: defaultConfig?.borderRadius || 4,
            isPreview: true
          };
          const previewMark = new TimeEventMark(config);
          chartSeries.series.attachPrimitive(previewMark);
          this.state = {
            ...this.state,
            previewMark
          };
          this.timeEventMarks.forEach(m => m.setShowHandles(false));
          previewMark.setShowHandles(true);
          this.timeToScriptMap.set(time, '');
          this.idToScriptMap.set(previewMark.id(), '');
        } else {
          const finalMark = this.state.previewMark;
          finalMark.setPreviewMode(false);
          finalMark.setShowHandles(true);
          const finalTime = finalMark.time();
          const finalId = finalMark.id();
          this.timeEventMarks.push(finalMark);
          this.timeToMarkMap.set(finalTime, finalMark);
          this.idToMarkMap.set(finalId, finalMark);
          if (!this.timeToScriptMap.has(finalTime)) {
            this.timeToScriptMap.set(finalTime, '');
          }
          this.state = {
            ...this.state,
            isTimeEventMode: false,
            previewMark: null
          };
          if (this.props.onCloseDrawing) {
            this.props.onCloseDrawing();
          }
        }
      } else {
        this.timeEventMarks.forEach(m => m.setShowHandles(false));
      }
    } catch (error) {
      this.state = this.cancelTimeEventMode();
    }
    return this.state;
  };

  public clearDoubleClickState(): void {
    this.lastClickTime = 0;
    this.lastClickMark = null;
  }

  public handleMouseMove = (point: Point): void => {
    const { chartSeries, chart, containerRef } = this.props;
    if (!chartSeries || !chart) return;

    try {
      const chartElement = chart.chartElement();
      if (!chartElement) return;
      const chartRect = chartElement.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const relativeX = point.x - (containerRect.left - chartRect.left);
      const timeScale = chart.timeScale();
      const time = timeScale.coordinateToTime(relativeX);
      if (time === null) return;
      if (this.state.isDragging && this.state.dragTarget && this.dragStartData) {
        const deltaX = relativeX - this.dragStartData.coordinate;
        this.state.dragTarget.dragByPixels(deltaX);
        const oldTime = this.state.dragTarget.time();
        const newTime = time;
        if (oldTime !== newTime) {
          this.timeToMarkMap.delete(oldTime);
          this.timeToMarkMap.set(newTime, this.state.dragTarget);
          const script = this.timeToScriptMap.get(oldTime);
          if (script !== undefined) {
            this.timeToScriptMap.delete(oldTime);
            this.timeToScriptMap.set(newTime, script);
          }
        }
        this.dragStartData = { time, coordinate: relativeX };
        return;
      }
      if (this.state.previewMark && this.state.isTimeEventMode) {
        this.state.previewMark.updateTime(time);

        const oldTime = this.state.previewMark.time();
        if (oldTime !== time) {
          const script = this.timeToScriptMap.get(oldTime);
          if (script !== undefined) {
            this.timeToScriptMap.delete(oldTime);
            this.timeToScriptMap.set(time, script);
          }
        }
      }
      if (!this.state.isTimeEventMode && !this.state.isDragging) {
        const hoveredMark = this.getMarkAtPoint(point);
        this.timeEventMarks.forEach(mark => {
          mark.setShowHandles(mark === hoveredMark);
        });
      }
    } catch (error) {
    }
  };

  public handleMouseUp = (point: Point): TimeEventMarkState => {
    if (this.state.isDragging) {
      if (this.state.dragTarget) {
        this.state.dragTarget.setDragging(false);
        const oldTime = this.dragStartData?.time;
        const newTime = this.state.dragTarget.time();
        if (oldTime && oldTime !== newTime) {
          this.timeToMarkMap.delete(oldTime);
          this.timeToMarkMap.set(newTime, this.state.dragTarget);
          const script = this.timeToScriptMap.get(oldTime);
          if (script !== undefined) {
            this.timeToScriptMap.delete(oldTime);
            this.timeToScriptMap.set(newTime, script);
          }
        }
      }
      this.state = {
        ...this.state,
        isDragging: false,
        dragTarget: null
      };
      this.isOperating = false;
    }
    this.dragStartData = null;
    return { ...this.state };
  };

  public handleKeyDown = (event: KeyboardEvent): TimeEventMarkState => {
    if (event.key === 'Escape') {
      if (this.state.isDragging) {
        if (this.state.dragTarget) {
          this.state.dragTarget.setDragging(false);
        }
        this.state = {
          ...this.state,
          isDragging: false,
          dragTarget: null
        };
      } else if (this.state.isTimeEventMode) {
        return this.cancelTimeEventMode();
      }
    }
    return this.state;
  };

  public getState(): TimeEventMarkState {
    return { ...this.state };
  }

  public updateProps(newProps: Partial<TimeEventMarkManagerProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  public destroy(): void {
    if (this.state.previewMark) {
      const time = this.state.previewMark.time();
      const id = this.state.previewMark.id();
      this.props.chartSeries?.series.detachPrimitive(this.state.previewMark);
      this.timeToScriptMap.delete(time);
      this.idToScriptMap.delete(id);
    }
    this.timeEventMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.timeEventMarks = [];
    this.timeToMarkMap.clear();
    this.timeToScriptMap.clear();
    this.idToMarkMap.clear();
    this.idToScriptMap.clear();
  }

  public getTimeEventMarks(): TimeEventMark[] {
    return [...this.timeEventMarks];
  }

  public removeTimeEventMark(mark: TimeEventMark): void {
    const index = this.timeEventMarks.indexOf(mark);
    if (index > -1) {
      const time = mark.time();
      const id = mark.id();
      this.props.chartSeries?.series.detachPrimitive(mark);
      this.timeEventMarks.splice(index, 1);
      this.timeToMarkMap.delete(time);
      this.timeToScriptMap.delete(time);
      this.idToMarkMap.delete(id);
      this.idToScriptMap.delete(id);
    }
  }

  public isOperatingOnChart(): boolean {
    return this.isOperating || this.state.isDragging || this.state.isTimeEventMode;
  }

  private hiddenMarks: TimeEventMark[] = [];

  public hideAllMarks(): void {
    this.hiddenMarks.push(...this.timeEventMarks);
    this.timeEventMarks.forEach(mark => {
      this.props.chartSeries?.series.detachPrimitive(mark);
    });
    this.timeEventMarks = [];
  }

  public showAllMarks(): void {
    this.timeEventMarks.push(...this.hiddenMarks);
    this.hiddenMarks.forEach(mark => {
      this.props.chartSeries?.series.attachPrimitive(mark);
    });
    this.hiddenMarks = [];
  }

  public hideMark(mark: TimeEventMark): void {
    const index = this.timeEventMarks.indexOf(mark);
    if (index > -1) {
      this.timeEventMarks.splice(index, 1);
      this.hiddenMarks.push(mark);
      this.props.chartSeries?.series.detachPrimitive(mark);
    }
  }

  public showMark(mark: TimeEventMark): void {
    const index = this.hiddenMarks.indexOf(mark);
    if (index > -1) {
      this.hiddenMarks.splice(index, 1);
      this.timeEventMarks.push(mark);
      this.props.chartSeries?.series.attachPrimitive(mark);
    }
  }

  private updateMarkTimeInMap(oldTime: number, newTime: number, mark: TimeEventMark): void {
    if (oldTime !== newTime) {
      this.timeToMarkMap.delete(oldTime);
      this.timeToMarkMap.set(newTime, mark);
    }
  }

  public hasMarkAtTime(time: number): boolean {
    return this.timeToMarkMap.has(time);
  }

  public getAllTimes(): number[] {
    return Array.from(this.timeToMarkMap.keys());
  }

  public getScriptById(id: string): string | null {
    return this.idToScriptMap.get(id) || null;
  }

  public setScriptById(id: string, script: string): void {
    this.idToScriptMap.set(id, script);
  }

  public getScriptByTime(time: number): string | null {
    const mark = this.timeToMarkMap.get(time);
    if (mark) {
      return this.idToScriptMap.get(mark.id()) || null;
    }
    return null;
  }

  public setScriptForTime(time: number, script: string): void {
    this.timeToScriptMap.set(time, script);
  }

  public removeScriptForTime(time: number): void {
    this.timeToScriptMap.delete(time);
  }

  public getAllTimesWithScript(): number[] {
    return Array.from(this.timeToScriptMap.keys());
  }

  public getAllScripts(): string[] {
    return Array.from(this.timeToScriptMap.values());
  }

  public getIdToScriptMap(): Map<string, string> {
    return new Map(this.idToScriptMap);
  }

  public getTimeToScriptMap(): Map<number, string> {
    const map = new Map<number, string>();
    this.timeToMarkMap.forEach((mark, time) => {
      const script = this.idToScriptMap.get(mark.id());
      if (script !== undefined) {
        map.set(time, script);
      }
    });
    return map;
  }


  public importScripts(scripts: Map<number, string> | Record<number, string>): void {
    if (scripts instanceof Map) {
      this.timeToScriptMap = new Map(scripts);
    } else {
      this.timeToScriptMap.clear();
      Object.entries(scripts).forEach(([time, script]) => {
        this.timeToScriptMap.set(Number(time), script);
      });
    }
  }

  public clearAllScripts(): void {
    this.timeToScriptMap.clear();
  }

  public hasScriptAtTime(time: number): boolean {
    const mark = this.timeToMarkMap.get(time);
    return mark ? this.idToScriptMap.has(mark.id()) : false;
  }

  public executeScriptAtTime(time: number): any {
    const mark = this.timeToMarkMap.get(time);
    if (!mark) return null;
    const script = this.idToScriptMap.get(mark.id());
    if (!script || script.trim() === '') {
      return null;
    }
    try {
      const capturedOutput: any[] = [];
      const customConsole = {
        log: (...args: any[]) => {
          capturedOutput.push({ type: 'log', args });
          console.log('[TimeEvent Script]', ...args);
        },
        info: (...args: any[]) => {
          capturedOutput.push({ type: 'info', args });
          console.info('[TimeEvent Script]', ...args);
        },
        warn: (...args: any[]) => {
          capturedOutput.push({ type: 'warn', args });
          console.warn('[TimeEvent Script]', ...args);
        },
        error: (...args: any[]) => {
          capturedOutput.push({ type: 'error', args });
          console.error('[TimeEvent Script]', ...args);
        },
        clear: () => {
          capturedOutput.length = 0;
          console.clear();
        }
      };
      const context = {
        time,
        id: mark.id(),
        chart: this.props.chart,
        chartSeries: this.props.chartSeries,
        manager: this,
        console: customConsole,
        Math,
        Date,
        JSON,
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval
      };
      const executeScript = new Function(
        'ctx',
        `
        const { 
          time, id, chart, chartSeries, manager, 
          console, Math, Date, JSON, 
          setTimeout, setInterval, clearTimeout, clearInterval 
        } = ctx;
        
        try {
          return (function() {
            ${script}
          })();
        } catch(e) {
          throw e;
        }
      `
      );
      const result = executeScript.call(null, context);
      if (capturedOutput.length > 0) {
        return {
          result,
          consoleOutput: capturedOutput,
          timestamp: Date.now()
        };
      }
      return result;
    } catch (error: any) {
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

}