import { Drawing, Point } from '../types';
import { DrawingConfig } from './DrawingConfigs';

export class DrawingOperations {
  static findDrawingAtPoint(point: Point, drawings: Drawing[], configs: Map<string, DrawingConfig>): Drawing | null {
    for (let i = drawings.length - 1; i >= 0; i--) {
      const drawing = drawings[i];
      const config = configs.get(drawing.type);

      if (config && config.isPointInShape(drawing, point)) {
        return drawing;
      }
    }
    return null;
  }

  static getResizeHandleAtPoint(point: Point, drawing: Drawing, configs: Map<string, DrawingConfig>): string | null {
    const config = configs.get(drawing.type);
    if (!config) return null;

    const bbox = config.getBoundingBox(drawing);

    if (drawing.type === 'text') {
      const handle = { x: bbox.x + bbox.width, y: bbox.y + bbox.height, type: 'se' };
      if (Math.abs(point.x - handle.x) < 6 && Math.abs(point.y - handle.y) < 6) {
        return handle.type;
      }
    } else {
      const handles = [
        { x: bbox.x, y: bbox.y, type: 'nw' },
        { x: bbox.x + bbox.width, y: bbox.y, type: 'ne' },
        { x: bbox.x, y: bbox.y + bbox.height, type: 'sw' },
        { x: bbox.x + bbox.width, y: bbox.y + bbox.height, type: 'se' }
      ];

      for (const handle of handles) {
        if (Math.abs(point.x - handle.x) < 6 && Math.abs(point.y - handle.y) < 6) {
          return handle.type;
        }
      }
    }

    return null;
  }

  static moveDrawing(drawing: Drawing, deltaX: number, deltaY: number): Drawing {
    return {
      ...drawing,
      points: drawing.points.map(p => ({
        x: p.x + deltaX,
        y: p.y + deltaY
      }))
    };
  }

  static resizeDrawing(drawing: Drawing, deltaX: number, deltaY: number, handle: string): Drawing {
    const updatedDrawing = { ...drawing };

    if (drawing.type === 'rectangle' && drawing.points.length === 2) {
      const [p1, p2] = drawing.points;
      switch (handle) {
        case 'nw':
          updatedDrawing.points = [
            { x: p1.x + deltaX, y: p1.y + deltaY },
            p2
          ];
          break;
        case 'ne':
          updatedDrawing.points = [
            { x: p1.x, y: p1.y + deltaY },
            { x: p2.x + deltaX, y: p2.y }
          ];
          break;
        case 'sw':
          updatedDrawing.points = [
            { x: p1.x + deltaX, y: p1.y },
            { x: p2.x, y: p2.y + deltaY }
          ];
          break;
        case 'se':
          updatedDrawing.points = [
            p1,
            { x: p2.x + deltaX, y: p2.y + deltaY }
          ];
          break;
      }
    } else if (drawing.type === 'text' && drawing.points.length === 1) {
      console.log('文字缩放由 TextManager 处理');
    }

    return updatedDrawing;
  }

  static moveText(drawing: Drawing, deltaX: number, deltaY: number): Drawing {
    if (drawing.points.length === 1) {
      return {
        ...drawing,
        points: [{
          x: drawing.points[0].x + deltaX,
          y: drawing.points[0].y + deltaY
        }]
      };
    }
    return drawing;
  }

  static calculateDrawingPoints(
    startPoint: Point | null,
    currentPoint: Point,
    tool: string,
    configs: Map<string, DrawingConfig>
  ): Point[] {
    if (!startPoint) return [];

    const config = configs.get(tool);
    if (config) {
      if (config.maxPoints === 1) {
        return [startPoint];
      } else if (config.maxPoints === 2) {
        return [startPoint, currentPoint];
      }
    }

    return [startPoint];
  }
}