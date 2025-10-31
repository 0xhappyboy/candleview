import { createChart, LineSeries, AreaSeries, CandlestickSeries } from 'lightweight-charts';

export interface DrawingPoint {
  time: string;
  price: number;
}

export interface DrawingShape {
  id: string;
  type: string;
  points: DrawingPoint[];
  properties?: any;
}

export class DrawingToolsManager {
  private chart: any = null;
  private drawings: DrawingShape[] = [];
  private currentDrawing: DrawingShape | null = null;
  private isDrawing: boolean = false;
  private currentTool: string | null = null;

  initialize(chart: any) {
    this.chart = chart;
    this.setupChartEvents();
  }

  private setupChartEvents() {
    if (!this.chart) return;

  }

  setDrawingTool(toolName: string) {
    this.currentTool = toolName;
    this.isDrawing = true;
    console.log(`Drawing tool activated: ${toolName}`);
    this.setupToolSpecificBehavior(toolName);
  }

  private setupToolSpecificBehavior(toolName: string) {
    switch (toolName) {
      case 'line':
      case 'trend-line':
        this.setupLineDrawing();
        break;
      case 'horizontal-line':
        this.setupHorizontalLineDrawing();
        break;
      case 'vertical-line':
        this.setupVerticalLineDrawing();
        break;
      case 'rectangle':
        this.setupRectangleDrawing();
        break;
      case 'text':
        this.setupTextDrawing();
        break;
      default:
        console.log(`Tool ${toolName} not fully implemented`);
    }
  }

  private setupLineDrawing() {
    console.log('Line drawing mode activated');
  }

  private setupHorizontalLineDrawing() {
    console.log('Horizontal line drawing mode activated');
  }

  private setupVerticalLineDrawing() {
    console.log('Vertical line drawing mode activated');
  }

  private setupRectangleDrawing() {
    console.log('Rectangle drawing mode activated');
  }

  private setupTextDrawing() {
    console.log('Text drawing mode activated');
  }


  addMarker(time: string, price: number, options?: any) {
    if (!this.chart) return;

    const marker = {
      time: time,
      position: 'inBar',
      color: options?.color || '#2962FF',
      shape: options?.shape || 'circle',
      text: options?.text || '',
    };

    console.log('Marker added:', marker);
  }


  addHorizontalLine(price: number, options?: any) {
    if (!this.chart) return;

    console.log('Horizontal line added at price:', price);
  }


  addTrendLine(startPoint: DrawingPoint, endPoint: DrawingPoint, options?: any) {
    const trendLine: DrawingShape = {
      id: `trendline_${Date.now()}`,
      type: 'trend-line',
      points: [startPoint, endPoint],
      properties: options
    };

    this.drawings.push(trendLine);
    this.renderDrawing(trendLine);
  }


  addDrawing(drawing: DrawingShape) {
    this.drawings.push(drawing);
    console.log('Drawing added to manager:', drawing);
  }


  handleChartClick(x: number, y: number, tool: string) {
    if (!this.chart) return;

    console.log(`DrawingManager: Handling click at x=${x}, y=${y} with tool=${tool}`);

    switch (tool) {
      case 'line':
        this.handleLineDrawing(x, y);
        break;
      case 'rectangle':
        this.handleRectangleDrawing(x, y);
        break;
      case 'text':
        this.handleTextDrawing(x, y);
        break;
      default:
        console.log(`Tool ${tool} drawing not implemented`);
    }
  }

  private handleLineDrawing(x: number, y: number) {
    console.log('Drawing line...');
  }

  private handleRectangleDrawing(x: number, y: number) {
    console.log('Drawing rectangle...');
  }

  private handleTextDrawing(x: number, y: number) {
    console.log('Adding text...');
  }


  private renderDrawing(drawing: DrawingShape) {
    console.log('Rendering drawing:', drawing);

    switch (drawing.type) {
      case 'trend-line':
        this.renderTrendLine(drawing);
        break;
      case 'rectangle':
        this.renderRectangle(drawing);
        break;
      case 'text':
        this.renderText(drawing);
        break;
    }
  }

  private renderTrendLine(drawing: DrawingShape) {
    console.log('Rendering trend line between:', drawing.points);
  }

  private renderRectangle(drawing: DrawingShape) {
    console.log('Rendering rectangle:', drawing.points);
  }

  private renderText(drawing: DrawingShape) {
    console.log('Rendering text:', drawing.properties?.text);
  }

  stopDrawing() {
    this.isDrawing = false;
    this.currentTool = null;
    this.currentDrawing = null;
    console.log('Drawing mode deactivated');
  }

  removeAllDrawings() {
    this.drawings = [];
    console.log('All drawings removed');
  }

  getDrawings(): DrawingShape[] {
    return this.drawings;
  }

  destroy() {
    this.drawings = [];
    this.currentDrawing = null;
    this.currentTool = null;
    this.isDrawing = false;
    this.chart = null;
  }
}
